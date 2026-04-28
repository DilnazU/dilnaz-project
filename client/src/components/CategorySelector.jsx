import { useRef, useEffect } from 'react';
import { TrendingUp, DollarSign, Lightbulb } from 'lucide-react';
import gsap from 'gsap';
import translations from '../locales/translations';

export default function CategorySelector({ selected, onSelect, language = 'ru' }) {
  const containerRef = useRef(null);
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

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2 justify-center">
      {categories.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
          style={selected === id ? {
            background: 'linear-gradient(135deg, #00ff87, #0ea5e9)',
            color: '#020817',
            boxShadow: '0 0 20px rgba(0,255,135,0.3)',
            border: '1px solid transparent',
            fontWeight: '600',
          } : {
            background: 'rgba(0,255,135,0.05)',
            border: '1px solid rgba(0,255,135,0.15)',
            color: 'rgba(148,163,184,0.7)',
          }}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}