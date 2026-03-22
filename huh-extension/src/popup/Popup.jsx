import React, { useState, useEffect } from 'react';
import TimestampSlider from '../components/TimestampSlider';
import ExplanationCard from '../components/ExplanationCard';
import Loader from '../components/Loader';
import './Popup.css';

const Popup = () => {
    const [duration, setDuration] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [explanation, setExplanation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isYouTube, setIsYouTube] = useState(false);

    // On mount, get video duration from the active YouTube tab
    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];

            if (!tab?.url?.includes('youtube.com/watch')) {
                setIsYouTube(false);
                return;
            }

            setIsYouTube(true);

            // Ask content script for the video duration
            chrome.tabs.sendMessage(tab.id, { type: 'GET_VIDEO_INFO' }, (response) => {
                if (chrome.runtime.lastError || !response?.success) {
                    setError('Could not connect to YouTube page. Try refreshing.');
                    return;
                }

                const vid = response.data;
                setDuration(vid.duration);
                // Default: select from current time to current time + 60s (or end of video)
                const defaultStart = Math.floor(vid.currentTime);
                const defaultEnd = Math.min(defaultStart + 60, vid.duration);
                setStartTime(defaultStart);
                setEndTime(defaultEnd);
            });
        });
    }, []);

    // Handle "Nirvana" button click — explain the selected segment
    const handleExplain = async () => {
        setLoading(true);
        setError(null);
        setExplanation(null);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'EXPLAIN_SEGMENT',
                startTime,
                endTime,
                level: 'beginner'
            }, (response) => {
                setLoading(false);

                if (chrome.runtime.lastError) {
                    setError('Lost connection to YouTube. Try refreshing the page.');
                    return;
                }

                if (response?.success) {
                    setExplanation(response.data.explanation);
                } else {
                    setError(response?.error || 'Something went wrong.');
                }
            });
        });
    };

    // Not on YouTube
    if (!isYouTube) {
        return (
            <div className="popup">
                <div className="popup-header">
                    <h1 className="popup-title">Huh?</h1>
                    <p className="popup-subtitle">I'm lost</p>
                </div>
                <div className="popup-not-youtube">
                    <p>🎬 Navigate to a YouTube video to get started.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="popup">
            {/* Header */}
            <div className="popup-header">
                <h1 className="popup-title">Huh?</h1>
                <p className="popup-subtitle">I'm lost</p>
            </div>

            {/* Timestamp Slider */}
            {duration > 0 && (
                <TimestampSlider
                    duration={duration}
                    startTime={startTime}
                    endTime={endTime}
                    onStartChange={setStartTime}
                    onEndChange={setEndTime}
                />
            )}

            {/* Nirvana Button */}
            <button
                className="nirvana-btn"
                onClick={handleExplain}
                disabled={loading || duration === 0}
            >
                {loading ? 'Processing...' : 'Nirvana'}
            </button>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <p>⚠️ {error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && <Loader message="Reaching nirvana..." />}

            {/* Explanation Result */}
            {explanation && <ExplanationCard explanation={explanation} />}
        </div>
    );
};

export default Popup;
