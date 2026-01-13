
import React, { useRef, useState } from 'react';
import { ModelType } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, type: ModelType, image?: string) => void;
  onVoiceOpen: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onVoiceOpen, isLoading }) => {
  const [text, setText] = useState('');
  const [modelType, setModelType] = useState<ModelType>(ModelType.FAST);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !preview) || isLoading) return;
    
    // Auto-detect image mode if preview exists
    const finalType = preview ? ModelType.IMAGE : modelType;
    
    onSendMessage(text, finalType, preview || undefined);
    setText('');
    setPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setModelType(ModelType.IMAGE);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 sticky bottom-0 transition-colors duration-300">
      {preview && (
        <div className="mb-3 relative inline-block">
          <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-indigo-100 dark:border-indigo-900 shadow-sm" />
          <button 
            onClick={() => setPreview(null)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {[
            { id: ModelType.FAST, icon: '⚡', label: 'Fast' },
            { id: ModelType.SEARCH, icon: '🔍', label: 'Research' },
            { id: ModelType.MAPS, icon: '📍', label: 'Logistic' },
            { id: ModelType.THINKING, icon: '🧠', label: 'Deep' }
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModelType(m.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                modelType === m.id 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none' 
                : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-700"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

          <button
            type="button"
            onClick={onVoiceOpen}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors border border-indigo-100 dark:border-indigo-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          <div className="flex-grow relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={modelType === ModelType.THINKING ? "Enter complex product query..." : "Ask KEK..."}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-sm dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none max-h-32"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          <button
            type="submit"
            disabled={(!text.trim() && !preview) || isLoading}
            className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${
              (!text.trim() && !preview) || isLoading
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none hover:scale-105 active:scale-95'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
