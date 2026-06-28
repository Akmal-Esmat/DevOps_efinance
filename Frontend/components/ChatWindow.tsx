'use client';
import { useEffect, useRef } from 'react';
import { Message } from '@/hooks/useChat';
import { ChatMessage } from '@/components/ChatMessage';
import { LoaderCircle } from "lucide-react";

export function ChatWindow({ messages, loading }: { messages: Message[]; loading: boolean }) {
  const lastUserMsgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lastUserMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [messages.length]); // trigger only when a new message is added

    // find the index of the most recent user message
  const lastUserIndex = messages.map(m => m.role).lastIndexOf('user');

  return (
    <div className="w-full max-w-5xl h-full overflow-y-auto space-y-4">

        {messages.map((m, i) => (
        <div key={i} ref={i === lastUserIndex ? lastUserMsgRef : null}>
          <ChatMessage message={m} />
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="rounded-2xl bg-white border border-slate-200 px-5 py-3 shadow-md">
            <LoaderCircle className="w-5 h-5 animate-spin text-slate-500" />
          </div>
        </div>
      )}
    </div>
  );
}