import React from 'react';
import { formatTime } from '../utils/formatTime';

/**
 * Dual-handle range slider for selecting start and end timestamps.
 * Max segment is capped at 50% of video duration.
 */
const TimestampSlider = ({ duration, startTime, endTime, onStartChange, onEndChange }) => {
    const maxSegment = duration * 0.5; // 50% of video duration

    const handleStartChange = (e) => {
        let newStart = Number(e.target.value);
        // Ensure start doesn't go past end, and segment stays within max
        if (newStart >= endTime) newStart = endTime - 1;
        if (endTime - newStart > maxSegment) newStart = endTime - maxSegment;
        onStartChange(Math.max(0, newStart));
    };

    const handleEndChange = (e) => {
        let newEnd = Number(e.target.value);
        // Ensure end doesn't go before start, and segment stays within max
        if (newEnd <= startTime) newEnd = startTime + 1;
        if (newEnd - startTime > maxSegment) newEnd = startTime + maxSegment;
        onEndChange(Math.min(duration, newEnd));
    };

    // Calculate positions for visual track highlight
    const startPercent = (startTime / duration) * 100;
    const endPercent = (endTime / duration) * 100;

    return (
        <div className="slider-container">
            <div className="slider-labels">
                <span className="slider-time">{formatTime(startTime)}</span>
                <span className="slider-time">{formatTime(endTime)}</span>
            </div>

            <div className="slider-track-wrapper">
                {/* Background track */}
                <div className="slider-track" />

                {/* Active range highlight */}
                <div
                    className="slider-active-track"
                    style={{
                        left: `${startPercent}%`,
                        width: `${endPercent - startPercent}%`,
                    }}
                />

                {/* Start handle */}
                <input
                    type="range"
                    className="slider-input slider-start"
                    min={0}
                    max={duration}
                    step={1}
                    value={startTime}
                    onChange={handleStartChange}
                />

                {/* End handle */}
                <input
                    type="range"
                    className="slider-input slider-end"
                    min={0}
                    max={duration}
                    step={1}
                    value={endTime}
                    onChange={handleEndChange}
                />
            </div>

            <div className="slider-labels">
                <span className="slider-bound">0:00</span>
                <span className="slider-bound">{formatTime(duration)}</span>
            </div>
        </div>
    );
};

export default TimestampSlider;
