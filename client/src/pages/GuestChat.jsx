import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatArea from '../components/ChatArea';
import ChatInput from '../components/ChatInput';
import CategorySelector from '../components/CategorySelector';
import PromptTemplates from '../components/PromptTemplates';
import { Moon, Sun, LogIn, UserPlus, X, MessageSquare, Save } from 'lucide-react';
import gsap from 'gsap';

export default function GuestChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [category, setCategory] = useState('marketing');
  const [loading, setLoading] = useState(false);
  const [showAuthBanner, setShowAuthBanner] = useState(true);
  const [dark, setDark] = useState(false);

  const navRef = useRef(null);
  const welcomeRef = useRef(null);
  const bannerRef = useRef(null);

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

  const toggleTheme = () => {
    setDark(!dark);
  };

  const sendMessage = async (text) => {
    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const { data } = await axios.post('/api/chat/guest', {
        message: text,
        history: messages,
        category,
      });
      setMessages((prev) => [...prev, data.message]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const dismissBanner = () => {
    if (bannerRef.current) {
      gsap.to(bannerRef.current, {
        y: -20, opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => setShowAuthBanner(false),
      });
    } else {
      setShowAuthBanner(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Navbar */}
      <header ref={navRef} className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" style={{ opacity: 0 }}>
        <h1 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <img src="/msb-logo.png" alt="MSB Help" className="w-7 h-7 object-contain" />
          MSB Help
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LogIn size={16} />
            <span className="hidden sm:inline">Sign in</span>
          </button>
          <button
            onClick={() => navigate('/login?signup=true')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Sign up</span>
          </button>
        </div>
      </header>

      {/* Auth recommendation banner */}
      {showAuthBanner && hasMessages && (
        <div ref={bannerRef} className="bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2.5">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
              <Save size={16} className="shrink-0" />
              <span>
                <button onClick={() => navigate('/login?signup=true')} className="font-semibold underline underline-offset-2 hover:text-emerald-900 dark:hover:text-emerald-100">Sign up</button>
                {' or '}
                <button onClick={() => navigate('/login')} className="font-semibold underline underline-offset-2 hover:text-emerald-900 dark:hover:text-emerald-100">sign in</button>
                {' to save your chats and get the full experience.'}
              </span>
            </div>
            <button
              onClick={dismissBanner}
              className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-500 dark:text-emerald-400"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Chat area or welcome screen */}
      {hasMessages ? (
        <ChatArea messages={messages} loading={loading} />
      ) : (
        <div ref={welcomeRef} className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center p-2">
              <img src="/msb-logo.png" alt="MSB Help" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              Welcome to MSB Help
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Your AI assistant for marketing, finance, and business ideas.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
              <MessageSquare size={12} />
              No account needed — start chatting right away.
            </p>
          </div>

          <CategorySelector selected={category} onSelect={setCategory} />
          <PromptTemplates category={category} onSelect={sendMessage} />

          <div className="mt-2 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Want saved chats and more?{' '}
              <button onClick={() => navigate('/login?signup=true')} className="text-emerald-500 hover:text-emerald-600 font-medium">
                Create a free account
              </button>
            </p>
          </div>
        </div>
      )}

      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}