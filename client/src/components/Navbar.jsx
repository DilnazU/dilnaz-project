import { useAuth } from '../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import { getLanguage, setLanguage as updateLanguage, subscribe } from '../context/LanguageStore';
import translations from '../locales/translations';
import { useState, useEffect } from 'react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [language, setLanguage] = useState(getLanguage());

  useEffect(() => {
    const unsubscribe = subscribe((newLang) => setLanguage(newLang));
    return unsubscribe;
  }, []);

  const handleChangeLanguage = (lang) => {
    updateLanguage(lang);
    setLanguage(lang);
  };

  const t = translations[language];
  const langLabels = { en: 'EN', ru: 'RU', kk: 'KK' };

  return (
    <nav className="relative z-10 flex justify-between items-center px-5 py-3.5 shrink-0"
      style={{ background: 'rgba(2,8,23,0.75)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,255,135,0.08)' }}>

      <button onClick={onToggleSidebar} className="p-2 rounded-lg transition-all hover:bg-white/5"
        style={{ color: 'rgba(0,255,135,0.6)' }}>
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-3">
        {/* Language selector */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
            style={{ background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.15)', color: '#00ff87' }}>
            {langLabels[language]}
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="absolute right-0 mt-1 w-36 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
            style={{ background: '#020f1a', border: '1px solid rgba(0,255,135,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            {Object.entries({ en: 'English', ru: 'Русский', kk: 'Қазақша' }).map(([lang, label]) => (
              <button key={lang} onClick={() => handleChangeLanguage(lang)}
                className="w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-white/5"
                style={{ color: language === lang ? '#00ff87' : 'rgba(148,163,184,0.6)', borderBottom: '1px solid rgba(0,255,135,0.06)', fontWeight: language === lang ? '600' : '400' }}>
                {lang.toUpperCase()} {label}
              </button>
            ))}
          </div>
        </div>

        {/* User */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.12)', color: 'rgba(0,255,135,0.8)' }}>
              {user.name}
            </div>
            <button onClick={logout} className="p-2 rounded-lg transition-all hover:bg-red-500/10"
              style={{ color: 'rgba(248,113,113,0.6)' }} title="Logout">
              <LogOut size={17} />
            </button>
          </div>
        ) : (
          <a href="/login" className="text-sm font-semibold transition-all hover:opacity-80" style={{ color: '#00ff87' }}>
            {t.navbar.account}
          </a>
        )}
      </div>
    </nav>
  );
}