import translations from '../locales/translations';
import { useTheme } from '../context/ThemeContext';

export default function PromptTemplates({ category, onSelect, language = 'ru' }) {
  const { dark } = useTheme();
  const t = translations[language];
  const templates = t.promptTemplates[category] || {};

  const accent = dark ? '#00ff87' : '#059669';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
      {Object.entries(templates).map(([key, value]) => (
        <button
          key={key}
          onClick={() => onSelect(value)}
          className="p-4 rounded-xl text-sm text-left transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
          style={{
            background: dark ? 'rgba(0,255,135,0.04)' : 'rgba(255,255,255,0.85)',
            border: dark ? '1px solid rgba(0,255,135,0.1)' : '1px solid rgba(5,150,105,0.2)',
            color: dark ? 'rgba(148,163,184,0.7)' : 'rgba(30,41,59,0.8)',
            boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.06)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = dark ? 'rgba(0,255,135,0.08)' : 'rgba(255,255,255,1)';
            e.currentTarget.style.border = dark ? '1px solid rgba(0,255,135,0.25)' : `1px solid ${accent}66`;
            e.currentTarget.style.color = dark ? '#e2e8f0' : '#0f172a';
            e.currentTarget.style.boxShadow = dark ? '0 0 20px rgba(0,255,135,0.08)' : `0 4px 20px rgba(5,150,105,0.12)`;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = dark ? 'rgba(0,255,135,0.04)' : 'rgba(255,255,255,0.85)';
            e.currentTarget.style.border = dark ? '1px solid rgba(0,255,135,0.1)' : '1px solid rgba(5,150,105,0.2)';
            e.currentTarget.style.color = dark ? 'rgba(148,163,184,0.7)' : 'rgba(30,41,59,0.8)';
            e.currentTarget.style.boxShadow = dark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.06)';
          }}
        >
          {value}
        </button>
      ))}
    </div>
  );
}