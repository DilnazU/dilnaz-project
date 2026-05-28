import { useRef, useEffect, useState } from 'react';
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';

export default function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, open, onClose }) {
  const listRef = useRef(null);
  const [deletingId, setDeletingId] = useState(null);
  const { dark } = useTheme();

  useEffect(() => {
    if (listRef.current && chats.length > 0) {
      const items = listRef.current.children;
      gsap.fromTo(items, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, stagger: 0.04, ease: 'power2.out' });
    }
  }, [chats]);

  const handleDelete = (e, chatId) => {
    e.stopPropagation();
    e.preventDefault();
    if (deletingId === chatId) return;
    setDeletingId(chatId);
    onDeleteChat(chatId);
    setTimeout(() => setDeletingId(null), 1000);
  };

  const accent = dark ? '#00ff87' : '#059669';
  const accentBlue = dark ? '#0ea5e9' : '#0284c7';
  const bg = dark
    ? 'linear-gradient(180deg, #020f1a 0%, #020c17 50%, #020817 100%)'
    : 'linear-gradient(180deg, #e8f5f0 0%, #eef2f7 50%, #f0f4f8 100%)';
  const borderColor = dark ? 'rgba(0,255,135,0.08)' : 'rgba(5,150,105,0.15)';
  const chatActiveBg = dark ? 'rgba(0,255,135,0.07)' : 'rgba(5,150,105,0.1)';
  const chatActiveBorder = dark ? 'rgba(0,255,135,0.15)' : 'rgba(5,150,105,0.25)';
  const chatTextActive = dark ? 'rgba(0,255,135,0.9)' : '#059669';
  const chatTextInactive = dark ? 'rgba(148,163,184,0.6)' : 'rgba(51,65,85,0.7)';
  const chatIconInactive = dark ? 'rgba(148,163,184,0.4)' : 'rgba(100,116,139,0.5)';
  const labelColor = dark ? 'rgba(0,255,135,0.3)' : 'rgba(5,150,105,0.5)';
  const emptyColor = dark ? 'rgba(148,163,184,0.3)' : 'rgba(100,116,139,0.4)';

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 flex flex-col transition-all duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ background: bg, borderRight: `1px solid ${borderColor}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: `1px solid ${borderColor}` }}>
          <div className="flex items-center gap-2.5">
            <svg width="22" height="26" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={accent}/>
                  <stop offset="100%" stopColor={accentBlue}/>
                </linearGradient>
              </defs>
              <polygon points="60,4 105,60 60,116 15,60" fill="none" stroke="url(#sg1)" strokeWidth="3"/>
              <polygon points="60,24 88,60 60,96 32,60" fill="url(#sg1)" fillOpacity="0.12"/>
              <polygon points="60,24 88,60 60,96 32,60" fill="none" stroke="url(#sg1)" strokeWidth="1.5"/>
              <circle cx="60" cy="4" r="4" fill={accent}/>
              <circle cx="105" cy="60" r="4" fill={accent}/>
              <circle cx="60" cy="116" r="4" fill={accentBlue}/>
              <circle cx="15" cy="60" r="4" fill={accentBlue}/>
            </svg>
            <span className="text-sm font-bold gradient-text">MSB Help</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onNewChat} className="p-2 rounded-lg transition-all hover:scale-105"
              style={{ background: dark ? 'rgba(0,255,135,0.1)' : 'rgba(5,150,105,0.1)', border: `1px solid ${accent}33`, color: accent }}
              title="New chat">
              <Plus size={15} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg md:hidden transition"
              style={{ color: `${accent}80` }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Chats label */}
        <div className="px-4 pt-4 pb-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: labelColor }}>Chats</span>
        </div>

        {/* Chat list */}
        <nav ref={listRef} className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {chats.length === 0 && (
            <div className="text-center py-8 px-4">
              <MessageSquare size={22} className="mx-auto mb-2" style={{ color: `${accent}33` }} />
              <p className="text-xs" style={{ color: emptyColor }}>No chats yet</p>
            </div>
          )}
          {chats.map((chat) => (
            <div
              key={chat._id}
              className="group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
              style={activeChatId === chat._id ? {
                background: chatActiveBg,
                border: `1px solid ${chatActiveBorder}`,
              } : { border: '1px solid transparent' }}
              onMouseOver={(e) => { if (activeChatId !== chat._id) e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.03)' : 'rgba(5,150,105,0.05)'; }}
              onMouseOut={(e) => { if (activeChatId !== chat._id) e.currentTarget.style.background = 'transparent'; }}
              onClick={() => onSelectChat(chat._id)}
            >
              <MessageSquare size={13} className="shrink-0"
                style={{ color: activeChatId === chat._id ? accent : chatIconInactive }} />
              <span className="flex-1 text-sm truncate"
                style={{ color: activeChatId === chat._id ? chatTextActive : chatTextInactive }}>
                {chat.title}
              </span>
              <button
                onClick={(e) => handleDelete(e, chat._id)}
                disabled={deletingId === chat._id}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-500/10 shrink-0 disabled:opacity-30"
                style={{ color: 'rgba(248,113,113,0.8)' }}
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </nav>

        <div className="h-12 pointer-events-none shrink-0"
          style={{ borderTop: `1px solid ${borderColor}` }} />
      </aside>
    </>
  );
}