import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getLanguage, subscribe } from '../context/LanguageStore';
import translations from '../locales/translations';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import ChatInput from '../components/ChatInput';
import CategorySelector from '../components/CategorySelector';
import PromptTemplates from '../components/PromptTemplates';
import BusinessAnalysis from '../components/BusinessAnalysis';
import gsap from 'gsap';

const api = axios.create({ withCredentials: true });

export default function Dashboard() {
  const [language, setLanguage] = useState(getLanguage());
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [category, setCategory] = useState('marketing');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const welcomeRef = useRef(null);

  const t = translations[language];

  useEffect(() => {
    const unsubscribe = subscribe((newLang) => {
      setLanguage(newLang);
    });
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
      setChats(data);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

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

  const newChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const deleteChat = async (chatId) => {
    try {
      await api.delete(`/api/chat/${chatId}`);
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
      fetchChats();
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const sendMessage = async (text) => {
    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const { data } = await api.post('/api/chat', {
        message: text,
        chatId: activeChatId,
        category,
      });

      setActiveChatId(data.chatId);
      setMessages((prev) => [...prev, data.message]);
      fetchChats();
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={newChat}
        onDeleteChat={deleteChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {hasMessages ? (
          <ChatArea messages={messages} loading={loading} />
        ) : (
          <div ref={welcomeRef} className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center p-2">
                <img src="/msb-logo.png" alt="MSB Help" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {t.dashboard.welcome}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.dashboard.subtitle}
              </p>
            </div>

            <CategorySelector selected={category} onSelect={setCategory} language={language} />
            <PromptTemplates category={category} onSelect={sendMessage} language={language} />
          </div>
        )}

        <ChatInput onSend={sendMessage} disabled={loading} language={language} />

        <button 
          onClick={() => setAnalysisOpen(true)}
          style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            padding: '12px 24px',
            background: 'rgba(16, 185, 129, 0.6)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            zIndex: '50',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            transition: 'all 0.3s ease',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            letterSpacing: '0.3px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(16, 185, 129, 0.8)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.35)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(16, 185, 129, 0.6)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.25)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <polyline points="19 5 9 5 4 12 9 19 19 19"></polyline>
          </svg>
          {t.dashboard.analysisBtn}
        </button>
      </div>

      <BusinessAnalysis 
        isOpen={analysisOpen} 
        onClose={() => setAnalysisOpen(false)}
        language={language}
      />
    </div>
  );
}