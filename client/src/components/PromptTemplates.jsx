import translations from '../locales/translations';

export default function PromptTemplates({ category, onSelect, language = 'ru' }) {
  const t = translations[language];
  const templates = t.promptTemplates[category] || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
      {Object.entries(templates).map(([key, value]) => (
        <button
          key={key}
          onClick={() => onSelect(value)}
          className="p-4 rounded-xl text-sm text-left transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
          style={{
            background: 'rgba(0,255,135,0.04)',
            border: '1px solid rgba(0,255,135,0.1)',
            color: 'rgba(148,163,184,0.7)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(0,255,135,0.08)';
            e.currentTarget.style.border = '1px solid rgba(0,255,135,0.25)';
            e.currentTarget.style.color = '#e2e8f0';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,135,0.08)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(0,255,135,0.04)';
            e.currentTarget.style.border = '1px solid rgba(0,255,135,0.1)';
            e.currentTarget.style.color = 'rgba(148,163,184,0.7)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
          }}
        >
          {value}
        </button>
      ))}
    </div>
  );
}