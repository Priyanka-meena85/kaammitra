import React, { createContext, useContext, useState, useEffect } from 'react';

const SimpleModeContext = createContext();

export const useSimpleMode = () => {
    return useContext(SimpleModeContext);
};

export const SimpleModeProvider = ({ children }) => {
    const [isSimpleMode, setIsSimpleMode] = useState(() => {
        const saved = localStorage.getItem('simpleMode');
        return saved ? JSON.parse(saved) : false;
    });

    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'hi';
    });

    useEffect(() => {
        localStorage.setItem('simpleMode', JSON.stringify(isSimpleMode));
    }, [isSimpleMode]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const toggleSimpleMode = () => setIsSimpleMode(prev => !prev);
    const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'hi' : 'en');

    return (
        <SimpleModeContext.Provider value={{ isSimpleMode, toggleSimpleMode, language, toggleLanguage }}>
            {children}
        </SimpleModeContext.Provider>
    );
};
