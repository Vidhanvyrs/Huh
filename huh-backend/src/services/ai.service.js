const config = require('../config/env');
const logger = require('../config/logger');

// ============================================================
// Circuit Breaker: Google AI Models (Free Tier)
// Cycles through all available free models. If one is rate-limited
// or fails, it automatically tries the next model in the list.
// ============================================================

const GOOGLE_AI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash-lite",
    "gemma-3-27b-it",
    "gemma-3-12b-it",
    "gemma-3-4b-it",
    "gemma-3-1b-it",
];

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Calls the Google AI API with circuit breaker — tries each model in order
 * until one succeeds. If all fail, throws an error with details.
 * 
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} The raw text response
 */
const callGoogleAI = async (prompt) => {
    const apiKey = config.geminiApiKey;

    if (!apiKey) {
        logger.error('GEMINI_API_KEY is missing from .env');
        throw new Error("GEMINI_API_KEY is missing from .env");
    }

    const errors = [];

    for (const model of GOOGLE_AI_MODELS) {
        try {
            logger.debug(`[Circuit Breaker] Trying model: ${model}`);

            const response = await fetch(`${BASE_URL}/${model}:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                logger.warn(`[Circuit Breaker] ${model} failed (${response.status})`, { errText: errText.slice(0, 200) });
                errors.push(`${model}: ${response.status} ${response.statusText}`);
                continue; // Try next model
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
                logger.warn(`[Circuit Breaker] ${model} returned empty/invalid response`);
                errors.push(`${model}: empty response`);
                continue; // Try next model
            }

            logger.info(`[Circuit Breaker] ✔ Success with model: ${model}`);
            return data.candidates[0].content.parts[0].text;

        } catch (error) {
            logger.warn(`[Circuit Breaker] ${model} threw an error`, { error: error.message });
            errors.push(`${model}: ${error.message}`);
            continue; // Try next model
        }
    }

    // All models failed
    logger.error('[Circuit Breaker] All models failed', { errors });
    throw new Error(`All Google AI models failed:\n${errors.join("\n")}`);
};

// ============================================================
// Generate Explanation (main export)
// ============================================================

/**
 * Sends transcript text to Google AI and returns a structured explanation.
 * Uses circuit breaker to cycle through models on failure.
 * 
 * @param {string} transcriptSegment - The plain transcript text
 * @param {string} level - "beginner" | "intermediate"
 * @returns {Promise<Object>} The parsed JSON explanation object
 */
const generateExplanation = async (transcriptSegment, level = "beginner") => {
    logger.debug('AI explanation generation started', { level, segmentLength: transcriptSegment.length });

    const prompt = `You are an expert tutor who explains complex technical or educational concepts in extremely simple and intuitive ways.
The user is providing you with a raw transcript segment from an educational video.
Your goal is to parse this segment, understand the context, and provide a clear, supportive, and non-judgmental explanation.

You MUST output ONLY valid JSON using the exact structure below. No markdown formatting blocks around the JSON. Just the raw JSON object.

{
  "whatTheyMeant": "A concise 1-2 sentence translation of the technical jargon.",
  "simpleExplanation": "A foundational explanation meant for a ${level} audience.",
  "example": "A real-world analogy or code example to solidify the concept.",
  "whyItMatters": "Why the user should care about this concept in the grand scheme of things.",
  "summary": "A 1-sentence wrap-up."
}

Here is the transcript segment to explain:
"${transcriptSegment}"

Return strictly valid JSON only.`;

    // Step 1: Call Google AI with circuit breaker
    let responseText;
    try {
        logger.debug('Sending prompt to Google AI (circuit breaker)...');
        responseText = await callGoogleAI(prompt);
        logger.debug('AI raw response received', { responsePreview: responseText.slice(0, 100) });
    } catch (err) {
        logger.error('All AI models failed', { error: err.message });
        throw new Error("Failed to reach any AI model.");
    }

    // Step 2: Parse the JSON response
    try {
        const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        logger.info('AI explanation generated successfully');
        return parsed;
    } catch (err) {
        logger.error('Failed to parse AI JSON response', {
            error: err.message,
            rawResponse: responseText
        });
        throw new Error("AI returned invalid JSON.");
    }
};

module.exports = { generateExplanation };