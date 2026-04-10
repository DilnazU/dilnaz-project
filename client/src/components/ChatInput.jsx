import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import gsap from 'gsap';

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.2, ease: 'power3.out' });
  }, []);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
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
    <div ref={containerRef} className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4" style={{ opacity: 0 }}>
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 placeholder-gray-400"
          style={{ maxHeight: '120px' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || disabled}
          className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
