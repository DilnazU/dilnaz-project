import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  // По умолчанию — ТЁМНАЯ тема.
  // Тёмная остаётся всегда, кроме случая, когда пользователь
  // сам ранее выбрал светлую (в localStorage сохранено 'light').
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== 'light'; // нет записи или 'dark' -> тёмная
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleTheme = () => setDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}