import { useAuth } from '../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import { getLanguage, setLanguage as updateLanguage, subscribe } from '../context/LanguageStore';
import translations from '../locales/translations';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { dark } = useTheme();
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

  return (
    <nav className="relative z-10 flex justify-between items-center px-5 py-3.5 shrink-0"
      style={{
        background: dark ? 'rgba(2,8,23,0.75)' : 'rgba(240,244,248,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: dark ? '1px solid rgba(0,255,135,0.08)' : '1px solid rgba(5,150,105,0.15)',
      }}>

      <button onClick={onToggleSidebar} className="p-2 rounded-lg transition-all hover:bg-white/5"
        style={{ color: dark ? 'rgba(0,255,135,0.6)' : 'rgba(5,150,105,0.8)' }}>
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Language selector */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
            style={{
              background: dark ? 'rgba(0,255,135,0.08)' : 'rgba(5,150,105,0.1)',
              border: dark ? '1px solid rgba(0,255,135,0.15)' : '1px solid rgba(5,150,105,0.2)',
              color: dark ? '#00ff87' : '#059669',
            }}>
            {language.toUpperCase()}
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="absolute right-0 mt-1 w-36 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
            style={{
              background: dark ? '#020f1a' : '#ffffff',
              border: dark ? '1px solid rgba(0,255,135,0.15)' : '1px solid rgba(5,150,105,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}>
            {Object.entries({ en: 'English', ru: 'Русский', kk: 'Қазақша' }).map(([lang, label]) => (
              <button key={lang} onClick={() => handleChangeLanguage(lang)}
                className="w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-white/5"
                style={{
                  color: language === lang ? (dark ? '#00ff87' : '#059669') : (dark ? 'rgba(148,163,184,0.6)' : 'rgba(51,65,85,0.7)'),
                  borderBottom: dark ? '1px solid rgba(0,255,135,0.06)' : '1px solid rgba(5,150,105,0.08)',
                  fontWeight: language === lang ? '600' : '400',
                }}>
                {lang.toUpperCase()} {label}
              </button>
            ))}
          </div>
        </div>

        {/* User */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                background: dark ? 'rgba(0,255,135,0.06)' : 'rgba(5,150,105,0.08)',
                border: dark ? '1px solid rgba(0,255,135,0.12)' : '1px solid rgba(5,150,105,0.15)',
                color: dark ? 'rgba(0,255,135,0.8)' : '#059669',
              }}>
              {user.name}
            </div>
            <button onClick={logout} className="p-2 rounded-lg transition-all hover:bg-red-500/10"
              style={{ color: 'rgba(248,113,113,0.6)' }} title="Logout">
              <LogOut size={17} />
            </button>
          </div>
        ) : (
          <a href="/login" className="text-sm font-semibold transition-all hover:opacity-80"
            style={{ color: dark ? '#00ff87' : '#059669' }}>
            {t.navbar.account}
          </a>
        )}
      </div>
    </nav>
  );
}