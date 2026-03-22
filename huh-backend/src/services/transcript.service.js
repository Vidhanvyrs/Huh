const https = require('https');
const logger = require('../config/logger');

const fetchUrl = async (url) => {
    const options = {
        headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)',
        }
    };

    const res = await fetch(url, options);
    
    if (!res.ok) {
        throw new Error(`Status Code: ${res.status}`);
    }

    return await res.text();
};

/**
 * Very basic, lightweight XML parser string match since we only need the text segments.
 * Supports both legacy <text start="..." dur="..."> and modern <p t="..." d="..."> formats.
 */
const parseXmlCaptions = (xmlText) => {
    const segments = [];
    
    // Modern format: <p t="startMs" d="durMs">content</p>
    const pRegex = /<p\s+t="(\d+)"(?:\s+d="(\d+)")?[^>]*>([\s\S]*?)<\/p>/gi;
    let match;
    let foundPFormat = false;
    
    while ((match = pRegex.exec(xmlText)) !== null) {
        foundPFormat = true;
        const start = parseInt(match[1], 10) / 1000; // convert ms to s
        const dur = match[2] ? parseInt(match[2], 10) / 1000 : 2.0;

        let text = match[3].replace(/<[^>]+>/g, ''); // strip nested tags like <s>
        text = decodeEntities(text);
        
        if (text) {
            segments.push({ start, dur, text });
        }
    }

    if (foundPFormat) return segments;

    // Legacy format: <text start="startSec" dur="durSec">content</text>
    const textRegex = /<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>(.*?)<\/text>/gi;
    while ((match = textRegex.exec(xmlText)) !== null) {
        const start = parseFloat(match[1]);
        const dur = match[2] ? parseFloat(match[2]) : 2.0;

        let text = match[3].replace(/<[^>]+>/g, '');
        text = decodeEntities(text);
        
        if (text) {
            segments.push({ start, dur, text });
        }
    }
    
    return segments;
};

const decodeEntities = (str) => {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/\n| /g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Uses a valid caption track URL to fetch the XML, parse it, and filter by time range.
 */
const fetchTranscriptSegment = async (tracks, startTime, endTime, contextWindow = 30) => {
    const track = 
        tracks.find(t => t.languageCode === 'en' && !t.kind) || 
        tracks.find(t => t.languageCode === 'en') || 
        tracks[0];
        
    if (!track || !track.baseUrl) {
        throw new Error('No valid track with baseUrl provided.');
    }

    try {
        const xmlText = await fetchUrl(track.baseUrl);
        
        logger.info(`Received transcript response. Length: ${xmlText.length}`);
        logger.info(`Preview: ${xmlText.slice(0, 200)}`);

        const segments = parseXmlCaptions(xmlText);
        
        if (segments.length === 0) {
            throw new Error('Could not parse timed text from XML response.');
        }

        const paddedStart = Math.max(0, startTime - contextWindow);
        const paddedEnd = endTime + contextWindow;

        const filteredText = segments
            .filter(seg => {
                const segEnd = seg.start + seg.dur;
                return segEnd >= paddedStart && seg.start <= paddedEnd;
            })
            .map(seg => seg.text)
            .join(' ')
            .trim();

        if (!filteredText) {
            throw new Error('No transcript found for the requested time range.');
        }

        return filteredText;
    } catch (error) {
        logger.error('Failed to fetch/parse transcript segment', { error: error.message, url: track.baseUrl });
        throw error;
    }
};

module.exports = { fetchTranscriptSegment };
