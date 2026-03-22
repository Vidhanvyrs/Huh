/**
 * Formats seconds into a human-readable timestamp string.
 * e.g. 90 → "1:30", 3661 → "1:01:01"
 *
 * @param {number} totalSeconds
 * @returns {string}
 */
export const formatTime = (totalSeconds) => {
    const sec = Math.floor(totalSeconds);
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Parses a timestamp string back to seconds.
 * e.g. "1:30" → 90, "1:01:01" → 3661
 *
 * @param {string} timeStr
 * @returns {number}
 */
export const parseTime = (timeStr) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
};
