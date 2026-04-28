import { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import gsap from 'gsap';

export default function ChatInput({ onSend, onStop, loading, language }) {
  const [text, setText] = useState('');
  const containerRef = useRef(null);

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

  return (
    <div ref={containerRef} className="px-4 pb-4 pt-3 shrink-0" style={{
      opacity: 0,
      background: 'rgba(2,8,23,0.75)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(0,255,135,0.08)',
    }}>
      <div className="flex flex-col gap-2 max-w-3xl mx-auto">

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={language === 'kk' ? 'Хабарламаңызды енгізіңіз...' : language === 'en' ? 'Type your message...' : 'Введите сообщение...'}
          rows={1}
          disabled={loading}
          className="w-full resize-none text-sm px-4 py-3 outline-none transition-all disabled:opacity-50"
          style={{
            background: 'rgba(0,255,135,0.04)',
            border: '1px solid rgba(0,255,135,0.12)',
            borderRadius: '14px',
            color: '#e2e8f0',
            maxHeight: '120px',
            caretColor: '#00ff87',
          }}
          onFocus={(e) => { e.target.style.border = '1px solid rgba(0,255,135,0.35)'; e.target.style.boxShadow = '0 0 20px rgba(0,255,135,0.08)'; }}
          onBlur={(e) => { e.target.style.border = '1px solid rgba(0,255,135,0.12)'; e.target.style.boxShadow = 'none'; }}
          onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
        />

        {/* Buttons row */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs" style={{ color: 'rgba(148,163,184,0.3)' }}>
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
                  background: text.trim() ? 'linear-gradient(135deg, #00ff87, #0ea5e9)' : 'rgba(0,255,135,0.08)',
                  color: text.trim() ? '#020817' : 'rgba(0,255,135,0.4)',
                  boxShadow: text.trim() ? '0 0 20px rgba(0,255,135,0.2)' : 'none',
                  border: text.trim() ? 'none' : '1px solid rgba(0,255,135,0.1)',
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