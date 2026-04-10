import { useRef, useEffect } from 'react';
import { TrendingUp, DollarSign, Lightbulb } from 'lucide-react';
import gsap from 'gsap';

const categories = [
  { id: 'marketing', label: 'Marketing', icon: TrendingUp },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'business-ideas', label: 'Business Ideas', icon: Lightbulb },
];

export default function CategorySelector({ selected, onSelect }) {
  const containerRef = useRef(null);

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
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selected === id
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  );
}
