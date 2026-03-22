import React from 'react';

/**
 * Pulsing dot loader animation.
 */
const Loader = ({ message = 'Thinking...' }) => {
    return (
        <div className="loader-container">
            <div className="loader-dots">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
            </div>
            <p className="loader-message">{message}</p>
        </div>
    );
};

export default Loader;
