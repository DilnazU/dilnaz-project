import { useRef, useEffect } from 'react';
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';
import gsap from 'gsap';

export default function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, open, onClose }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current && chats.length > 0) {
      const items = listRef.current.children;
      gsap.fromTo(items, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, stagger: 0.04, ease: 'power2.out' });
    }
  }, [chats]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Chats
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onNewChat}
              className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
              title="New chat"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <nav ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
              No chats yet
            </p>
          )}
          {chats.map((chat) => (
            <div
              key={chat._id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeChatId === chat._id
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => onSelectChat(chat._id)}
            >
              <MessageSquare size={16} className="shrink-0" />
              <span className="flex-1 text-sm truncate">{chat.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat._id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-opacity"
                title="Delete chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
