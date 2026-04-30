import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { useTheme } from '../context/ThemeContext';

export default function ChatArea({ messages, loading }) {
  const containerRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const { dark } = useTheme();

  const accent = dark ? '#00ff87' : '#059669';
  const accentBlue = dark ? '#0ea5e9' : '#0284c7';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      isUserScrollingRef.current = scrollHeight - scrollTop - clientHeight > 150;
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isUserScrollingRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  if (messages.length === 0 && !loading) return null;

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6" style={{ background: 'transparent' }}>
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} index={i} />
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md text-sm"
              style={{
                background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
                border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(5,150,105,0.15)',
                boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
              }}>
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: accent, animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: accent, animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: accentBlue, animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}