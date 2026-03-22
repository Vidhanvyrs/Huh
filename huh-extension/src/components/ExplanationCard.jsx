import React from 'react';

/**
 * Displays the structured AI explanation with 5 sections.
 */
const ExplanationCard = ({ explanation }) => {
    if (!explanation) return null;

    const sections = [
        { key: 'whatTheyMeant', icon: '💡', title: 'What They Meant' },
        { key: 'simpleExplanation', icon: '📖', title: 'Simple Explanation' },
        { key: 'example', icon: '🔍', title: 'Example' },
        { key: 'whyItMatters', icon: '🎯', title: 'Why It Matters' },
        { key: 'summary', icon: '✅', title: 'Summary' },
    ];

    return (
        <div className="explanation-card">
            <h3 className="explanation-header">AI EXPLANATION</h3>
            {sections.map(({ key, icon, title }) => (
                explanation[key] && (
                    <div key={key} className="explanation-section">
                        <h4 className="section-title">{icon} {title}</h4>
                        <p className="section-content">{explanation[key]}</p>
                    </div>
                )
            ))}
        </div>
    );
};

export default ExplanationCard;
