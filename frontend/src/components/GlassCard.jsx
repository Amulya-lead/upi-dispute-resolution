import React from 'react';

const GlassCard = ({ children, className = '', highlightColor = 'var(--border-accent)' }) => {
    return (
        <div className={`glass-card ${className}`}>
            {children}
            <style>{`
        .glass-card {
            background: rgba(255,255,255,0.07);
            backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
            border: 1px solid rgba(196,181,253,0.28);
            border-radius: 28px; padding: 44px 40px;
            box-shadow: 0 32px 80px rgba(0,0,0,0.55),
                        0 0 90px rgba(139,92,246,0.14),
                        0 0 0 1px rgba(255,255,255,0.06) inset,
                        0 1px 0 rgba(255,255,255,0.18) inset;
            position: relative; overflow: hidden;
        }
        [data-theme="light"] .glass-card {
            background: rgba(255,255,255,0.85);
            border: 1px solid var(--border);
            box-shadow: var(--shadow-card);
        }
        [data-theme="dark"] .glass-card {
            background: var(--bg-surface);
            border: 1px solid var(--border);
            box-shadow: var(--shadow-card);
        }
        .glass-card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, ${highlightColor}, transparent);
        }
      `}</style>
        </div>
    );
};

export default GlassCard;
