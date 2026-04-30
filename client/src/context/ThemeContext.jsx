import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatArea from '../components/ChatArea';
import ChatInput from '../components/ChatInput';
import CategorySelector from '../components/CategorySelector';
import PromptTemplates from '../components/PromptTemplates';
import ThemeToggle from '../components/ThemeToggle';
import { LogIn, UserPlus, X, MessageSquare, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';

export default function GuestChat() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [category, setCategory] = useState('marketing');
  const [loading, setLoading] = useState(false);
  const [showAuthBanner, setShowAuthBanner] = useState(true);
  const readerRef = useRef(null);
  const navRef = useRef(null);
  const welcomeRef = useRef(null);
  const bannerRef = useRef(null);

  const accent = dark ? '#00ff87' : '#059669';
  const accentBlue = dark ? '#0ea5e9' : '#0284c7';
  const bgMain = dark ? '#020817' : '#f8fafc';
  const starColor1 = dark ? '#00ff87' : '#059669';
  const starColor2 = dark ? '#0ea5e9' : '#0284c7';
  const starWhite = dark ? '#ffffff' : '#94a3b8';
  const starOpacityMax = dark ? 0.85 : 0.2;
  const starOpacityMin = dark ? 0.15 : 0.05;
  const blob1 = dark ? 'rgba(0,255,135,0.07)' : 'rgba(5,150,105,0.08)';
  const blob2 = dark ? 'rgba(14,165,233,0.08)' : 'rgba(2,132,199,0.08)';
  const headerBg = dark ? 'rgba(2,8,23,0.7)' : 'rgba(248,250,252,0.85)';
  const headerBorder = dark ? 'rgba(0,255,135,0.1)' : 'rgba(5,150,105,0.15)';
  const bannerBg = dark ? 'rgba(0,255,135,0.05)' : 'rgba(5,150,105,0.06)';
  const bannerBorder = dark ? 'rgba(0,255,135,0.1)' : 'rgba(5,150,105,0.15)';
  const subtitleColor = dark ? 'rgba(148,163,184,0.7)' : '#475569';
  const hintColor = dark ? 'rgba(0,255,135,0.4)' : 'rgba(5,150,105,0.6)';
  const logoTextColor = dark ? 'white' : '#0f172a';
  const saveChatColor = dark ? 'rgba(148,163,184,0.4)' : '#64748b';

  useEffect(() => {
    gsap.fromTo(navRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
  }, []);

  useEffect(() => {
    if (welcomeRef.current) {
      const els = welcomeRef.current.children;
      gsap.fromTo(els, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' });
    }
  }, [messages.length === 0]);

  useEffect(() => {
    if (bannerRef.current && showAuthBanner && messages.length > 0) {
      gsap.fromTo(bannerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
    }
  }, [showAuthBanner, messages.length > 0]);

  const stopGeneration = () => {
    if (readerRef.current) { readerRef.current.cancel(); readerRef.current = null; }
    setLoading(false);
  };

  const sendMessage = async (text) => {
    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/chat/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages, category }),
      });
      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(line.replace('data: ', ''));
            if (parsed.text) {
              setMessages((prev) => prev.map((msg, i) =>
                i === assistantIndex ? { ...msg, content: msg.content + parsed.text } : msg
              ));
            }
          } catch {}
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => prev.map((msg, i) =>
          i === assistantIndex ? { ...msg, content: 'Sorry, something went wrong.' } : msg
        ));
      }
    } finally {
      readerRef.current = null;
      setLoading(false);
    }
  };

  const dismissBanner = () => {
    if (bannerRef.current) {
      gsap.to(bannerRef.current, { y: -20, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => setShowAuthBanner(false) });
    } else {
      setShowAuthBanner(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen relative overflow-hidden" style={{ background: bgMain, transition: 'background 0.3s ease' }}>
      <style>{`
        @keyframes blobMove1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,30px) scale(0.95)} }
        @keyframes blobMove2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-25px,20px) scale(1.08)} 66%{transform:translate(20px,-25px) scale(0.95)} }
        @keyframes twinkle { 0%,100%{opacity:0.15;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.8)} }
      `}</style>

      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: Math.random() * 4 + 1.5 + 'px',
            height: Math.random() * 4 + 1.5 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            background: i % 3 === 0 ? starColor1 : i % 3 === 1 ? starColor2 : starWhite,
            opacity: Math.random() * (starOpacityMax - starOpacityMin) + starOpacityMin,
            animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`,
            animationDelay: Math.random() * 5 + 's',
          }} />
        ))}
      </div>

      {/* Blobs */}
      <div className="absolute pointer-events-none" style={{ top: '-10%', right: '-5%', width: '500px', height: '500px', background: `radial-gradient(circle, ${blob1} 0%, transparent 70%)`, filter: 'blur(80px)', animation: 'blobMove1 12s ease-in-out infinite' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '-10%', left: '-5%', width: '450px', height: '450px', background: `radial-gradient(circle, ${blob2} 0%, transparent 70%)`, filter: 'blur(80px)', animation: 'blobMove2 15s ease-in-out infinite' }} />

      {/* Header */}
      <header ref={navRef} className="relative z-10 flex items-center justify-between px-5 py-3.5 shrink-0"
        style={{ opacity: 0, background: headerBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${headerBorder}` }}>
        <div className="flex items-center gap-2.5">
          <svg width="28" height="32" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="ng1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={accent}/><stop offset="100%" stopColor={accentBlue}/></linearGradient></defs>
            <polygon points="60,4 105,60 60,116 15,60" fill="none" stroke="url(#ng1)" strokeWidth="2.5"/>
            <polygon points="60,24 88,60 60,96 32,60" fill="url(#ng1)" fillOpacity="0.1"/>
            <polygon points="60,24 88,60 60,96 32,60" fill="none" stroke="url(#ng1)" strokeWidth="1.2"/>
            <line x1="60" y1="4" x2="60" y2="24" stroke={accent} strokeWidth="2"/>
            <line x1="105" y1="60" x2="88" y2="60" stroke={accent} strokeWidth="2"/>
            <line x1="60" y1="116" x2="60" y2="96" stroke={accentBlue} strokeWidth="2"/>
            <line x1="15" y1="60" x2="32" y2="60" stroke={accentBlue} strokeWidth="2"/>
            <circle cx="60" cy="4" r="4" fill={accent}/><circle cx="105" cy="60" r="4" fill={accent}/>
            <circle cx="60" cy="116" r="4" fill={accentBlue}/><circle cx="15" cy="60" r="4" fill={accentBlue}/>
            <line x1="32" y1="60" x2="60" y2="24" stroke="url(#ng1)" strokeWidth="0.8" opacity="0.35"/>
            <line x1="88" y1="60" x2="60" y2="24" stroke="url(#ng1)" strokeWidth="0.8" opacity="0.35"/>
            <line x1="32" y1="60" x2="60" y2="96" stroke="url(#ng1)" strokeWidth="0.8" opacity="0.35"/>
            <line x1="88" y1="60" x2="60" y2="96" stroke="url(#ng1)" strokeWidth="0.8" opacity="0.35"/>
          </svg>
          <span className="text-base font-bold" style={{ background: `linear-gradient(135deg, ${accent}, ${accentBlue})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MSB Help</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
            style={{ color: accent, border: `1px solid ${accent}33`, background: dark ? 'transparent' : 'rgba(255,255,255,0.6)' }}>
            <LogIn size={15} /><span className="hidden sm:inline">Войти</span>
          </button>
          <button onClick={() => navigate('/login?signup=true')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accentBlue})`, color: dark ? '#020817' : '#ffffff', boxShadow: `0 0 15px ${accent}40` }}>
            <UserPlus size={15} /><span className="hidden sm:inline">Регистрация</span>
          </button>
        </div>
      </header>

      {/* Auth banner */}
      {showAuthBanner && hasMessages && (
        <div ref={bannerRef} className="relative z-10 px-4 py-2.5 shrink-0"
          style={{ background: bannerBg, borderBottom: `1px solid ${bannerBorder}` }}>
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm" style={{ color: accent }}>
              <Save size={15} className="shrink-0" />
              <span>
                <button onClick={() => navigate('/login?signup=true')} className="font-semibold underline underline-offset-2" style={{ color: accent }}>Зарегистрируйтесь</button>
                {' или '}
                <button onClick={() => navigate('/login')} className="font-semibold underline underline-offset-2" style={{ color: accent }}>войдите</button>
                {' чтобы сохранять чаты.'}
              </span>
            </div>
            <button onClick={dismissBanner} className="p-1 rounded-lg transition hover:bg-white/10" style={{ color: `${accent}99` }}>
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {hasMessages ? (
          <ChatArea messages={messages} loading={loading} />
        ) : (
          <div ref={welcomeRef} className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
            <div className="text-center">
              <div className="mx-auto mb-5 w-24 h-28 flex items-center justify-center" style={{ filter: `drop-shadow(0 0 20px ${accent}4d)` }}>
                <svg width="96" height="112" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
                  <defs><linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={accent}/><stop offset="100%" stopColor={accentBlue}/></linearGradient></defs>
                  <polygon points="60,4 105,60 60,116 15,60" fill="none" stroke="url(#wg1)" strokeWidth="2.5"/>
                  <polygon points="60,24 88,60 60,96 32,60" fill="url(#wg1)" fillOpacity="0.1"/>
                  <polygon points="60,24 88,60 60,96 32,60" fill="none" stroke="url(#wg1)" strokeWidth="1.2"/>
                  <line x1="60" y1="4" x2="60" y2="24" stroke={accent} strokeWidth="2"/>
                  <line x1="105" y1="60" x2="88" y2="60" stroke={accent} strokeWidth="2"/>
                  <line x1="60" y1="116" x2="60" y2="96" stroke={accentBlue} strokeWidth="2"/>
                  <line x1="15" y1="60" x2="32" y2="60" stroke={accentBlue} strokeWidth="2"/>
                  <circle cx="60" cy="4" r="4.5" fill={accent}/><circle cx="105" cy="60" r="4.5" fill={accent}/>
                  <circle cx="60" cy="116" r="4.5" fill={accentBlue}/><circle cx="15" cy="60" r="4.5" fill={accentBlue}/>
                  <line x1="32" y1="60" x2="60" y2="24" stroke="url(#wg1)" strokeWidth="0.8" opacity="0.35"/>
                  <line x1="88" y1="60" x2="60" y2="24" stroke="url(#wg1)" strokeWidth="0.8" opacity="0.35"/>
                  <line x1="32" y1="60" x2="60" y2="96" stroke="url(#wg1)" strokeWidth="0.8" opacity="0.35"/>
                  <line x1="88" y1="60" x2="60" y2="96" stroke="url(#wg1)" strokeWidth="0.8" opacity="0.35"/>
                  <text x="60" y="134" textAnchor="middle" fontSize="13" fontWeight="bold" fontFamily="Arial" fill={logoTextColor} letterSpacing="2">MSB HELP</text>
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ background: `linear-gradient(135deg, ${accent}, ${accentBlue})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Добро пожаловать
              </h2>
              <p className="text-sm max-w-sm mx-auto mb-1" style={{ color: subtitleColor }}>
                AI-ассистент для маркетинга, финансов и бизнес-идей.
              </p>
              <p className="text-xs flex items-center justify-center gap-1" style={{ color: hintColor }}>
                <MessageSquare size={11} />Аккаунт не нужен — начните прямо сейчас.
              </p>
            </div>
            <CategorySelector selected={category} onSelect={setCategory} />
            <PromptTemplates category={category} onSelect={sendMessage} />
            <div className="mt-1 text-center">
              <p className="text-xs" style={{ color: saveChatColor }}>
                Хотите сохранять чаты?{' '}
                <button onClick={() => navigate('/login?signup=true')} className="font-semibold transition hover:opacity-80" style={{ color: accent }}>
                  Создать аккаунт
                </button>
              </p>
            </div>
          </div>
        )}
        <ChatInput onSend={sendMessage} onStop={stopGeneration} loading={loading} />
      </div>
    </div>
  );
}