import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLanguage, subscribe } from '../context/LanguageStore';
import translations from '../locales/translations';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import ChatInput from '../components/ChatInput';
import CategorySelector from '../components/CategorySelector';
import PromptTemplates from '../components/PromptTemplates';
import OnboardingWizard from '../components/OnboardingWizard';
import useOnboarding from '../hooks/useOnboarding';
import { api } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';

export default function Dashboard() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [language, setLanguage] = useState(getLanguage());
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [category, setCategory] = useState('marketing');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const welcomeRef = useRef(null);
  const readerRef = useRef(null);

  const t = translations[language];
  const { show: showOnboarding, complete: completeOnboarding } = useOnboarding();

  useEffect(() => {
    const unsubscribe = subscribe((newLang) => setLanguage(newLang));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (welcomeRef.current && messages.length === 0) {
      const els = welcomeRef.current.children;
      gsap.fromTo(els, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' });
    }
  }, [messages.length, activeChatId]);

  const fetchChats = useCallback(async () => {
    try {
      const { data } = await api.get('/api/chat');
      setChats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  }, []);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  const selectChat = async (chatId) => {
    try {
      const { data } = await api.get(`/api/chat/${chatId}`);
      setActiveChatId(data._id);
      setMessages(data.messages);
      setCategory(data.category);
      setSidebarOpen(false);
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  };

  const newChat = () => { setActiveChatId(null); setMessages([]); setSidebarOpen(false); };

  const deleteChat = useCallback(async (chatId) => {
    setChats(prev => prev.filter(c => c._id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }
    try {
      await api.delete(`/api/chat/${chatId}`);
    } catch (err) {
      console.error('Failed to delete chat:', err);
      fetchChats();
    }
  }, [activeChatId, fetchChats]);

  const stopGeneration = () => {
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
    setLoading(false);
  };

  const sendMessage = async (text) => {
    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify({ message: text, chatId: activeChatId, category }),
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
            if (parsed.chatId) { setActiveChatId(parsed.chatId); fetchChats(); }
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

  const hasMessages = messages.length > 0;

  // Цвета тем
  const accent = dark ? '#00ff87' : '#059669';
  const accentBlue = dark ? '#0ea5e9' : '#0284c7';
  const bgMain = dark ? '#020817' : '#f8fafc';
  const gridColor = dark ? 'rgba(0,255,135,0.03)' : 'rgba(5,150,105,0.05)';
  const blob1 = dark ? 'rgba(0,255,135,0.06)' : 'rgba(5,150,105,0.1)';
  const blob2 = dark ? 'rgba(14,165,233,0.07)' : 'rgba(2,132,199,0.1)';
  const starColor1 = dark ? '#00ff87' : '#059669';
  const starColor2 = dark ? '#0ea5e9' : '#0284c7';
  const starOpacity = dark ? [0.1, 0.5] : [0.05, 0.15];
  const subtitleColor = dark ? 'rgba(148,163,184,0.6)' : '#475569';
  const logoTextColor = dark ? 'white' : '#0f172a';

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: bgMain, transition: 'background 0.3s ease' }}>
      <style>{`
        @keyframes blobFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-15px) scale(1.05)} }
        @keyframes blobFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-15px,20px) scale(1.08)} }
        @keyframes twinkle { 0%,100%{opacity:0.15;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.8)} }
      `}</style>

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Stars/dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            background: i % 2 === 0 ? starColor1 : starColor2,
            opacity: Math.random() * (starOpacity[1] - starOpacity[0]) + starOpacity[0],
            animation: `twinkle ${Math.random() * 5 + 3}s ease-in-out infinite`,
            animationDelay: Math.random() * 5 + 's',
          }} />
        ))}
      </div>

      {/* Blobs */}
      <div className="absolute pointer-events-none" style={{ top: '-5%', left: '-5%', width: '500px', height: '500px', background: `radial-gradient(circle, ${blob1} 0%, transparent 70%)`, filter: 'blur(80px)', animation: 'blobFloat1 14s ease-in-out infinite' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '0', right: '-5%', width: '450px', height: '450px', background: `radial-gradient(circle, ${blob2} 0%, transparent 70%)`, filter: 'blur(80px)', animation: 'blobFloat2 16s ease-in-out infinite' }} />

      {/* Дополнительный блоб для светлой темы */}
      {!dark && (
        <div className="absolute pointer-events-none" style={{ top: '40%', left: '40%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      )}

      <Sidebar chats={chats} activeChatId={activeChatId} onSelectChat={selectChat} onNewChat={newChat} onDeleteChat={deleteChat} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {hasMessages ? (
          <ChatArea messages={messages} loading={loading} />
        ) : (
          <div ref={welcomeRef} className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
            <div className="text-center">
              <div className="mx-auto mb-5 w-24 h-28 flex items-center justify-center" style={{ filter: `drop-shadow(0 0 24px ${accent}50)` }}>
                <svg width="96" height="112" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="dg1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={accent}/>
                      <stop offset="100%" stopColor={accentBlue}/>
                    </linearGradient>
                  </defs>
                  <polygon points="60,4 105,60 60,116 15,60" fill="none" stroke="url(#dg1)" strokeWidth="2.5"/>
                  <polygon points="60,24 88,60 60,96 32,60" fill="url(#dg1)" fillOpacity="0.15"/>
                  <polygon points="60,24 88,60 60,96 32,60" fill="none" stroke="url(#dg1)" strokeWidth="1.2"/>
                  <line x1="60" y1="4" x2="60" y2="24" stroke={accent} strokeWidth="2"/>
                  <line x1="105" y1="60" x2="88" y2="60" stroke={accent} strokeWidth="2"/>
                  <line x1="60" y1="116" x2="60" y2="96" stroke={accentBlue} strokeWidth="2"/>
                  <line x1="15" y1="60" x2="32" y2="60" stroke={accentBlue} strokeWidth="2"/>
                  <circle cx="60" cy="4" r="4.5" fill={accent}/>
                  <circle cx="105" cy="60" r="4.5" fill={accent}/>
                  <circle cx="60" cy="116" r="4.5" fill={accentBlue}/>
                  <circle cx="15" cy="60" r="4.5" fill={accentBlue}/>
                  <line x1="32" y1="60" x2="60" y2="24" stroke="url(#dg1)" strokeWidth="0.8" opacity="0.35"/>
                  <line x1="88" y1="60" x2="60" y2="24" stroke="url(#dg1)" strokeWidth="0.8" opacity="0.35"/>
                  <line x1="32" y1="60" x2="60" y2="96" stroke="url(#dg1)" strokeWidth="0.8" opacity="0.35"/>
                  <line x1="88" y1="60" x2="60" y2="96" stroke="url(#dg1)" strokeWidth="0.8" opacity="0.35"/>
                  <text x="60" y="134" textAnchor="middle" fontSize="13" fontWeight="bold" fontFamily="Arial" fill={logoTextColor} letterSpacing="2">MSB HELP</text>
                </svg>
              </div>

              <h2 className="text-3xl font-bold mb-2 gradient-text">
                {t.dashboard.welcome}
              </h2>
              <p className="text-sm max-w-sm mx-auto" style={{ color: subtitleColor }}>
                {t.dashboard.subtitle}
              </p>
            </div>
            <CategorySelector selected={category} onSelect={setCategory} language={language} />
            <PromptTemplates category={category} onSelect={sendMessage} language={language} />
          </div>
        )}

        <ChatInput onSend={sendMessage} onStop={stopGeneration} loading={loading} language={language} />

        <button
          onClick={() => navigate('/analysis')}
          className="absolute flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{
            top: '72px', right: '20px', zIndex: 50,
            background: dark ? 'rgba(0,255,135,0.08)' : 'rgba(255,255,255,0.9)',
            border: `1px solid ${accent}44`,
            backdropFilter: 'blur(10px)',
            color: accent,
            boxShadow: dark ? `0 0 20px ${accent}1a` : `0 4px 16px rgba(5,150,105,0.15)`,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="2" x2="12" y2="22"/><polyline points="19 5 9 5 4 12 9 19 19 19"/>
          </svg>
          {t.dashboard.analysisBtn}
        </button>
      </div>

      {showOnboarding && (
        <OnboardingWizard
          language={language}
          onComplete={(cat) => {
            if (cat) setCategory(cat);
            completeOnboarding();
          }}
        />
      )}
    </div>
  );
}