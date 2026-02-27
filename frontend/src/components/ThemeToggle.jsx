import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('adminTheme') || 'dark';
        setIsDark(savedTheme === 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark ? 'dark' : 'light';
        setIsDark(!isDark);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('adminTheme', newTheme);
    };

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            title="Toggle Dark/Light Mode"
        >
            {isDark ? <Moon size={14} id="themeIcon" /> : <Sun size={14} id="themeIcon" />}
            <div className="toggle-track">
                <div className="toggle-thumb"></div>
            </div>
            <span id="themeLabel">{isDark ? 'Dark' : 'Light'}</span>

            <style>{`
        .theme-toggle {
          display: flex; align-items: center; gap: 8px; padding: 8px 16px;
          background: var(--bg-surface); border: 1px solid var(--border);
          border-radius: 30px; cursor: pointer; font-size: 12px; font-weight: 700;
          color: var(--text-secondary); transition: var(--transition); white-space: nowrap;
        }
        .theme-toggle:hover { border-color: var(--border-accent); background: var(--bg-elevated); }
        .toggle-track {
          width: 38px; height: 20px; border-radius: 10px; position: relative; transition: var(--transition);
          flex-shrink: 0;
        }
        [data-theme="dark"]  .toggle-track { background: #374151; }
        [data-theme="light"] .toggle-track { background: var(--red-vivid); }
        .toggle-thumb {
          position: absolute; top: 2px; width: 16px; height: 16px; border-radius: 50%;
          background: white; transition: transform 0.3s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        [data-theme="dark"]  .toggle-thumb { transform: translateX(2px); }
        [data-theme="light"] .toggle-thumb { transform: translateX(20px); }
      `}</style>
        </button>
    );
};

export default ThemeToggle;
