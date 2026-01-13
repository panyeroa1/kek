
import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import VoiceModal from './components/VoiceModal';
import { Message, MessageSender, ModelType, GroundingChunk } from './types';
import { askGemini } from './services/geminiService';
import { PRODUCT_APPS } from './constants';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kek-theme');
      return (saved as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: MessageSender.AI,
      text: "Welcome to KEK! I'm your elite product research agent. I can track TikTok viral trends, find suppliers on Alibaba/Lazada, and link hardware to the right companion apps. \n\nWhat are we sourcing today?",
      timestamp: Date.now(),
      modelUsed: ModelType.FAST
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('kek-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSendMessage = async (text: string, type: ModelType, image?: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: MessageSender.USER,
      text,
      image,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await askGemini(text || (image ? "Analyze this product." : ""), type, image);
      
      const grounding: GroundingChunk[] = [];
      const candidates = (response as any).candidates;
      if (candidates?.[0]?.groundingMetadata?.groundingChunks) {
        candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
          if (chunk.web) grounding.push({ web: chunk.web });
          if (chunk.maps) grounding.push({ maps: chunk.maps });
        });
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: MessageSender.AI,
        text: response.text || "I couldn't process that request.",
        timestamp: Date.now(),
        modelUsed: type,
        grounding,
        isThinking: type === ModelType.THINKING
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        sender: MessageSender.AI,
        text: "System error: Failed to reach KEK intelligence hub. Check your connection.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-slate-50 dark:bg-slate-950 shadow-xl border-x border-slate-200 dark:border-slate-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100 dark:shadow-none">
            K
          </div>
          <div>
            <h1 className="font-bold text-slate-800 dark:text-slate-100 leading-none">KEK Messenger</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">AI Integrated</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-700"
            title="Toggle Theme"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728L5.121 5.121M19 12a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            )}
          </button>
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-700"
            title="Sourcing Apps"
            onClick={() => {
              const list = PRODUCT_APPS.map(a => `• ${a.name}: ${a.description} (for ${a.connectsTo})`).join('\n');
              setMessages(prev => [...prev, {
                id: 'apps-' + Date.now(),
                sender: MessageSender.SYSTEM,
                text: "Recommended Ecosystem Apps:\n" + list,
                timestamp: Date.now()
              }]);
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages */}
      <main 
        ref={scrollRef}
        className="flex-grow overflow-y-auto px-4 py-6 hide-scrollbar space-y-4"
      >
        {messages.map(m => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm transition-colors">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Input */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        onVoiceOpen={() => setShowVoice(true)} 
        isLoading={isLoading} 
      />

      {/* Voice Layer */}
      {showVoice && <VoiceModal onClose={() => setShowVoice(false)} />}
    </div>
  );
};

export default App;
