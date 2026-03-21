'use client';

import { useState, useRef, useEffect } from 'react';
import { useOrderChat } from '@/hooks/useOrderChat';
import { MessageBubble } from './MessageBubble';
import { OrderStatus } from '@/types/order';

interface Props {
  slug: string;
  order_uuid: string;
  orderStatus: OrderStatus;
}

const CUSTOMER_NAME_KEY = 'customer_chat_name';

function ChatIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

export function OrderChat({ slug, order_uuid, orderStatus }: Props) {
  const [senderName, setSenderName] = useState('');
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CUSTOMER_NAME_KEY);
    setSenderName(stored?.trim() || 'Cliente');
  }, []);

  const { messages, sendMessage } = useOrderChat(slug, order_uuid, senderName);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isClosed = orderStatus === 'delivered' || orderStatus === 'cancelled';

  const handleSend = () => {
    if (!input.trim() || isClosed) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-(--color-primary) px-4 py-3.5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
          <ChatIcon />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white text-sm">Chat com o estabelecimento</p>
          {isClosed ? (
            <p className="text-white/60 text-xs">Conversa encerrada</p>
          ) : (
            <p className="text-white/80 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
              Online
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-2.5 max-h-72 overflow-y-auto bg-gray-50/60">
        {messages.length === 0 && (
          <div className="py-8 flex flex-col items-center gap-2 text-gray-400">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <ChatIcon />
            </div>
            <p className="text-sm text-center">Nenhuma mensagem ainda.<br />Diga olá!</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.uuid} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isClosed ? (
        <div className="px-3 py-3 border-t border-gray-100 flex items-center gap-2 bg-white">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary)/20 transition-all placeholder:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full bg-(--color-primary) text-white flex items-center justify-center disabled:opacity-30 hover:opacity-90 active:scale-95 transition-all shrink-0"
          >
            <SendIcon />
          </button>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400 text-center">Esta conversa foi encerrada.</p>
        </div>
      )}
    </div>
  );
}
