
import React from 'react';
import { Message, MessageSender, ModelType } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;
  
  const getBadgeColor = (type?: ModelType) => {
    switch (type) {
      case ModelType.SEARCH: return 'bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400';
      case ModelType.MAPS: return 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400';
      case ModelType.THINKING: return 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400';
      case ModelType.IMAGE: return 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl shadow-sm transition-colors ${
        isUser 
        ? 'bg-indigo-600 text-white' 
        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800'
      }`}>
        {message.image && (
          <img src={message.image} alt="Upload" className="rounded-lg mb-2 max-h-60 w-full object-cover" />
        )}
        
        {!isUser && message.modelUsed && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${getBadgeColor(message.modelUsed)}`}>
              {message.modelUsed}
            </span>
            {message.isThinking && <span className="animate-pulse text-[10px] text-purple-400">Thinking...</span>}
          </div>
        )}

        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
        </div>

        {!isUser && message.grounding && message.grounding.length > 0 && (
          <div className="mt-3 pt-2 border-t border-slate-50 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mb-1">Sources</p>
            <div className="flex flex-wrap gap-2">
              {message.grounding.map((g, idx) => (
                <a 
                  key={idx} 
                  href={g.web?.uri || g.maps?.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-indigo-500 dark:text-indigo-400 py-1 px-2 rounded-md border border-slate-100 dark:border-slate-700 truncate max-w-[150px] transition-colors"
                >
                  {g.web?.title || g.maps?.title || 'Link'}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className={`text-[10px] mt-1.5 opacity-50 ${isUser ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
