import { useState, useRef, useEffect } from 'react';
import { Copy, Check, User } from 'lucide-react';
import gsap from 'gsap';

export default function MessageBubble({ message, index }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const bubbleRef = useRef(null);

  useEffect(() => {
    if (bubbleRef.current) {
      gsap.fromTo(
        bubbleRef.current,
        { y: 16, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out', delay: index * 0.02 }
      );
    }
  }, [index]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={bubbleRef} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`} style={{ opacity: 0 }}>
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center p-1">
          <img src="/msb-logo.png" alt="MSB" className="w-full h-full object-contain" />
        </div>
      )}

      <div
        className={`group relative max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-emerald-500 text-white rounded-br-md'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
        }`}
      >
        {message.content}
        <button
          onClick={handleCopy}
          className={`absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-xs transition-opacity ${
            isUser
              ? 'text-gray-400 hover:text-gray-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
          title="Copy message"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <User size={16} className="text-gray-500 dark:text-gray-400" />
        </div>
      )}
    </div>
  );
}
