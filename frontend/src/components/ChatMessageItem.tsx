'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Wrench, Copy, Check, AlertCircle } from 'lucide-react';
import { Message } from '../types/chat';

interface ChatMessageItemProps {
  message: Message;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full mb-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start max-w-[92%] sm:max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <User className="w-4 h-4" />
          </div>
        ) : message.error ? (
          <div className="w-8 h-8 rounded-full bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center shrink-0 shadow-md">
            <AlertCircle className="w-4 h-4" />
          </div>
        ) : (
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-blue-500/40 shadow-md shrink-0 bg-gray-950">
            <Image
              src="/order-assistant-logo.png"
              alt="Order Assistant AI"
              fill
              sizes="32px"
              className="object-cover"
            />
          </div>
        )}

        {/* Message Container */}
        <div className={`rounded-2xl px-4 py-3 shadow-md ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : message.error
              ? 'bg-rose-950/40 text-rose-200 border border-rose-800/80 rounded-tl-none'
              : 'bg-gray-900 border border-gray-800 text-gray-100 rounded-tl-none'
        }`}>
          {/* Header metadata */}
          <div className="flex items-center justify-between gap-4 mb-1 text-[11px] text-gray-400">
            <span className="font-semibold tracking-wide uppercase">
              {isUser ? 'You' : 'Order Assistant AI'}
            </span>
            <div className="flex items-center space-x-2">
              <span>{message.timestamp}</span>
              {!isUser && (
                <button
                  onClick={handleCopy}
                  className="p-1 hover:text-white text-gray-400 transition-colors"
                  title="Copy response"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>

          {/* Executed Tools Badge (if assistant invoked function calls) */}
          {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mb-2.5 pt-1 flex flex-wrap gap-1.5">
              {message.toolCalls.map((tc, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800/50"
                >
                  <Wrench className="w-3 h-3 text-indigo-400" />
                  <span>{tc.tool}</span>
                </span>
              ))}
            </div>
          )}

          {/* Message Content */}
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose-custom">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
