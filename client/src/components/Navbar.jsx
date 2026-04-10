import { useState, useEffect } from 'react';
import { getLanguage, setLanguage, subscribe } from '../context/LanguageStore';

export default function Navbar({ onToggleSidebar }) {
  const [language, setLang] = useState(getLanguage());

  useEffect(() => {
    const unsubscribe = subscribe((newLang) => {
      setLang(newLang);
    });
    return unsubscribe;
  }, []);

  const texts = {
    en: { account: 'Account', logout: 'Logout' },
    ru: { account: 'Аккаунт', logout: 'Выход' },
    kk: { account: 'Аккаунт', logout: 'Шығу' },
  };

  const t = texts[language];

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
      <button 
        onClick={onToggleSidebar} 
        className="text-gray-400 hover:text-gray-200 text-xl"
      >
        ☰
      </button>

      <div className="flex items-center gap-6">
        <select 
          value={language}
          onChange={handleLanguageChange}
          style={{
            padding: '10px 14px',
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            border: '1.5px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          <option value="en">🇬🇧 English</option>
          <option value="ru">🇷🇺 Русский</option>
          <option value="kk">🇰🇿 Қазақша</option>
        </select>

        <div className="flex items-center gap-4 border-l border-gray-700 pl-6">
          <span className="text-gray-400 text-sm">{t.account}</span>
          <button className="text-gray-400 hover:text-emerald-400 transition-colors text-sm font-medium">
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  );
}