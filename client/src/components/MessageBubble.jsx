import { useState, useRef, useEffect } from 'react';
import { Copy, Check, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import gsap from 'gsap';

export default function MessageBubble({ message, index }) {
  const [copied, setCopied] = useState(false);
  const [displayed, setDisplayed] = useState('');
  const isUser = message.role === 'user';
  const bubbleRef = useRef(null);
  const prevContentRef = useRef('');
  const queueRef = useRef('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (bubbleRef.current) {
      gsap.fromTo(
        bubbleRef.current,
        { y: 16, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out', delay: index * 0.02 }
      );
    }
  }, [index]);

  // Плавный стриминг — как у ChatGPT
  useEffect(() => {
    if (isUser) {
      setDisplayed(message.content);
      return;
    }

    const newChars = message.content.slice(prevContentRef.current.length);
    prevContentRef.current = message.content;

    if (!newChars) return;

    queueRef.current += newChars;

    if (timerRef.current) return;

    const flush = () => {
      if (queueRef.current.length === 0) {
        timerRef.current = null;
        return;
      }
      // Берём по 2-3 символа за раз — плавно и быстро
      const chunk = queueRef.current.slice(0, 3);
      queueRef.current = queueRef.current.slice(3);
      setDisplayed(prev => prev + chunk);
      timerRef.current = setTimeout(flush, 12);
    };

    timerRef.current = setTimeout(flush, 12);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [message.content, isUser]);

  // Если стриминг закончился — показать всё
  useEffect(() => {
    if (!isUser && message.content && displayed.length < message.content.length) {
      const timeout = setTimeout(() => {
        setDisplayed(message.content);
        queueRef.current = '';
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }, message.content.length * 15 + 500);
      return () => clearTimeout(timeout);
    }
  }, [message.content, isUser]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contentToShow = isUser ? message.content : displayed;

  return (
    <div ref={bubbleRef} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`} style={{ opacity: 0 }}>

      <div className="group relative max-w-[80%] px-4 py-3 text-sm leading-relaxed"
        style={isUser ? {
          background: 'linear-gradient(135deg, rgba(0,255,135,0.15), rgba(14,165,233,0.1))',
          border: '1px solid rgba(0,255,135,0.2)',
          color: '#f1f5f9',
          borderRadius: '18px 18px 4px 18px',
          boxShadow: '0 4px 20px rgba(0,255,135,0.08)',
        } : {
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#e2e8f0',
          borderRadius: '18px 18px 18px 4px',
        }}>

        {isUser ? (
          <span className="whitespace-pre-wrap">{contentToShow}</span>
        ) : (
          <>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold" style={{ color: '#00ff87' }}>{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="ml-2">{children}</li>,
                code: ({ inline, children }) =>
                  inline ? (
                    <code className="px-1.5 py-0.5 rounded text-xs font-mono"
                      style={{ background: 'rgba(0,255,135,0.1)', color: '#00ff87' }}>{children}</code>
                  ) : (
                    <pre className="p-3 rounded-lg mt-2 mb-2 overflow-x-auto"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,255,135,0.15)' }}>
                      <code className="text-xs font-mono" style={{ color: '#00ff87' }}>{children}</code>
                    </pre>
                  ),
              }}
            >
              {contentToShow}
            </ReactMarkdown>
            {/* Курсор пока идёт стриминг */}
            {displayed.length < message.content.length && (
              <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle"
                style={{ background: '#00ff87', borderRadius: '1px' }} />
            )}
          </>
        )}

        <button
          onClick={handleCopy}
          className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-xs transition-all"
          style={{ color: 'rgba(0,255,135,0.5)' }}
          title="Copy"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>

      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.15)' }}>
          <User size={14} style={{ color: 'rgba(0,255,135,0.7)' }} />
        </div>
      )}
    </div>
  );
}