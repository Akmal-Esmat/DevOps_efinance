'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { ChatWindow } from '../../components/ChatWindow';
import { ChatInput } from '../../components/ChatInput';

export default function Chat() {
  const { messages, loading, sendMessage } = useChat();

  return (
    <main className="h-screen bg-gradient-to-br from-blue-50 via-white to-violet-100 flex flex-col">

      {/* Floating Home Button */}
      <Link href="/" className="fixed top-6 left-6 z-50">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 shadow-xl border border-slate-200 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-slate-50 hover:shadow-2xl">
          <X className="w-6 h-6 text-slate-700" />
        </div>
      </Link>

      {/* Scrollable messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-6 pb-32">
          <ChatWindow
            messages={messages}
            loading={loading}
          />
        </div>
      </div>

      {/* Fixed input */}
      <div className="sticky bottom-0 z-40 bg-gradient-to-t from-blue-50 via-white to-transparent">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <ChatInput onSend={sendMessage} />
        </div>
      </div>

    </main>
  );
}