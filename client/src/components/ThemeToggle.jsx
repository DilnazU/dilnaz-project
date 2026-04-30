import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl transition-all hover:scale-105"
      style={{
        background: dark ? 'rgba(0,255,135,0.08)' : 'rgba(5,150,105,0.1)',
        border: dark ? '1px solid rgba(0,255,135,0.2)' : '1px solid rgba(5,150,105,0.25)',
        color: dark ? '#00ff87' : '#059669',
      }}
      title={dark ? 'Светлая тема' : 'Тёмная тема'}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}