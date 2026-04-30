import { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';

export default function ChatInput({ onSend, onStop, loading, language }) {
  const [text, setText] = useState('');
  const containerRef = useRef(null);
  const { dark } = useTheme();

  useEffect(() => {
    gsap.fromTo(containerRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.2, ease: 'power3.out' });
  }, []);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const accent = dark ? '#00ff87' : '#059669';
  const bg = dark ? 'rgba(2,8,23,0.75)' : 'rgba(240,244,248,0.85)';
  const borderTop = dark ? '1px solid rgba(0,255,135,0.08)' : '1px solid rgba(5,150,105,0.15)';
  const inputBg = dark ? 'rgba(0,255,135,0.04)' : 'rgba(255,255,255,0.8)';
  const inputBorder = dark ? '1px solid rgba(0,255,135,0.12)' : '1px solid rgba(5,150,105,0.2)';
  const inputBorderFocus = dark ? '1px solid rgba(0,255,135,0.35)' : '1px solid rgba(5,150,105,0.5)';
  const inputColor = dark ? '#e2e8f0' : '#0f172a';
  const hintColor = dark ? 'rgba(148,163,184,0.3)' : 'rgba(100,116,139,0.5)';

  return (
    <div ref={containerRef} className="px-4 pb-4 pt-3 shrink-0" style={{
      opacity: 0,
      background: bg,
      backdropFilter: 'blur(16px)',
      borderTop,
    }}>
      <div className="flex flex-col gap-2 max-w-3xl mx-auto">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={language === 'kk' ? 'Хабарламаңызды енгізіңіз...' : language === 'en' ? 'Type your message...' : 'Введите сообщение...'}
          rows={1}
          disabled={loading}
          className="w-full resize-none text-sm px-4 py-3 outline-none transition-all disabled:opacity-50"
          style={{
            background: inputBg,
            border: inputBorder,
            borderRadius: '14px',
            color: inputColor,
            maxHeight: '120px',
            caretColor: accent,
          }}
          onFocus={(e) => { e.target.style.border = inputBorderFocus; e.target.style.boxShadow = `0 0 20px ${accent}15`; }}
          onBlur={(e) => { e.target.style.border = inputBorder; e.target.style.boxShadow = 'none'; }}
          onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
        />

        <div className="flex items-center justify-between px-1">
          <span className="text-xs" style={{ color: hintColor }}>
            {language === 'kk' ? 'Enter — жіберу' : language === 'en' ? 'Enter to send' : 'Enter — отправить'}
          </span>

          <div className="flex items-center gap-2">
            {loading ? (
              <button
                onClick={onStop}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
              >
                <Square size={14} fill="#ef4444" />
                {language === 'kk' ? 'Тоқтату' : language === 'en' ? 'Stop' : 'Остановить'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: text.trim() ? `linear-gradient(135deg, ${accent}, ${dark ? '#0ea5e9' : '#0284c7'})` : `${accent}15`,
                  color: text.trim() ? (dark ? '#020817' : '#ffffff') : `${accent}66`,
                  boxShadow: text.trim() ? `0 0 20px ${accent}33` : 'none',
                  border: text.trim() ? 'none' : `1px solid ${accent}22`,
                }}
              >
                <Send size={14} />
                {language === 'kk' ? 'Жіберу' : language === 'en' ? 'Send' : 'Отправить'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}