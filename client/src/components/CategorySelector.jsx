import { useRef, useEffect } from 'react';
import { TrendingUp, DollarSign, Lightbulb } from 'lucide-react';
import gsap from 'gsap';
import translations from '../locales/translations';
import { useTheme } from '../context/ThemeContext';

export default function CategorySelector({ selected, onSelect, language = 'ru' }) {
  const containerRef = useRef(null);
  const { dark } = useTheme();
  const t = translations[language];

  const categories = [
    { id: 'marketing', label: t.dashboard.marketing, icon: TrendingUp },
    { id: 'finance', label: t.dashboard.finance, icon: DollarSign },
    { id: 'businessIdeas', label: t.dashboard.businessIdeas, icon: Lightbulb },
  ];

  useEffect(() => {
    if (containerRef.current) {
      const buttons = containerRef.current.children;
      gsap.fromTo(buttons, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, stagger: 0.07, ease: 'back.out(1.7)' });
    }
  }, []);

  const accent = dark ? '#00ff87' : '#059669';
  const accentBlue = dark ? '#0ea5e9' : '#0284c7';

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2 justify-center">
      {categories.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
          style={selected === id ? {
            background: `linear-gradient(135deg, ${accent}, ${accentBlue})`,
            color: dark ? '#020817' : '#ffffff',
            boxShadow: `0 0 20px ${accent}4d`,
            border: '1px solid transparent',
            fontWeight: '600',
          } : {
            background: dark ? 'rgba(0,255,135,0.05)' : 'rgba(255,255,255,0.8)',
            border: dark ? '1px solid rgba(0,255,135,0.15)' : '1px solid rgba(5,150,105,0.25)',
            color: dark ? 'rgba(148,163,184,0.7)' : 'rgba(30,60,50,0.75)',
            boxShadow: dark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}