'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Loader2, Trash2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onClearHistory: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onClearHistory,
  isLoading,
  disabled
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center gap-2 p-2 bg-gray-900/90 border border-gray-800 rounded-2xl shadow-xl focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
        
        {/* Clear Chat Button */}
        <button
          type="button"
          onClick={onClearHistory}
          title="Clear Conversation History"
          disabled={isLoading || disabled}
          className="p-2.5 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Input Field */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about orders, revenue, top customers, or look up order ORD-1001..."
          rows={1}
          disabled={isLoading || disabled}
          className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 resize-none outline-none py-1.5 px-1 max-h-32 disabled:opacity-50"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!input.trim() || isLoading || disabled}
          className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500 px-3 mt-1.5">
        <span>Press <kbd className="px-1 py-0.5 bg-gray-800 text-gray-400 rounded">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-gray-800 text-gray-400 rounded">Shift + Enter</kbd> for line break</span>
        <span>Powered by OpenAI &amp; FastAPI</span>
      </div>
    </form>
  );
};
