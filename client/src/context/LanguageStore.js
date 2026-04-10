let currentLanguage = localStorage.getItem('language') || 'en';
const listeners = [];

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  listeners.forEach(listener => listener(lang));
}

export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners.splice(listeners.indexOf(listener), 1);
  };
}