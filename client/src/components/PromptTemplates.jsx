import { useState } from 'react';
import translations from '../locales/translations';

export default function PromptTemplates({ category, onSelect, language = 'en' }) {
  const t = translations[language];
  const templates = t.promptTemplates[category] || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
      {Object.entries(templates).map(([key, value]) => (
        <button
          key={key}
          onClick={() => onSelect(value)}
          className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors text-sm text-left"
        >
          {value}
        </button>
      ))}
    </div>
  );
}