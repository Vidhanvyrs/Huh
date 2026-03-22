// API connection back to Node server

const API_BASE_URL = 'http://localhost:3000';

/**
 * Sends the extracted transcript text to the backend for AI explanation.
 * 
 * @param {string} transcript - The plain transcript text
 * @param {string} level - "beginner" | "intermediate"
 * @returns {Promise<Object>} The explanation object from Gemini
 */
const getExplanation = async (transcript, level = 'beginner') => {
    const response = await fetch(`${API_BASE_URL}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, level })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `Backend error (${response.status})`);
    }

    const data = await response.json();
    return data.explanation;
};

/**
 * Checks if the backend is running.
 */
const checkHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        return data.status === 'ok';
    } catch {
        return false;
    }
};

export { getExplanation, checkHealth, API_BASE_URL };
