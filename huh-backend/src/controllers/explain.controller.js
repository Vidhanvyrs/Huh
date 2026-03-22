const { generateExplanation } = require('../services/ai.service');
const logger = require('../config/logger');

const explainVideoSegment = async (req, res) => {
    const { transcript, level = 'beginner' } = req.body;

    logger.info('POST /api/explain called', { level, transcriptLength: transcript?.length });

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 10) {
        logger.warn('Missing or invalid transcript in request body');
        return res.status(400).json({ error: 'Missing or invalid transcript text.' });
    }

    try {
        logger.info('Generating AI explanation...');
        const explanation = await generateExplanation(transcript.trim(), level);

        logger.info('Success — explanation generated');
        return res.status(200).json({ explanation });

    } catch (error) {
        logger.error('explainVideoSegment failed', {
            message: error.message,
            stack: error.stack
        });

        if (error.message.includes('invalid JSON')) {
            return res.status(502).json({ error: 'AI returned an unexpected response. Please try again.' });
        }

        return res.status(500).json({ error: 'Failed to generate explanation.' });
    }
};

module.exports = { explainVideoSegment };