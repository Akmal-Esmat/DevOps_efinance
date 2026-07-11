'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ChatWindow } from '@/components/ChatWindow';
import { ChatInput } from '@/components/ChatInput';
import { ModelSelector } from '@/components/ModelSelector';

export default function Chat() {
  const {
  messages,
  loading,
  sendMessage,
  models,
  selectedModel,
  setSelectedModel,
  error,
} = useChat();

return (
  <main className="h-screen bg-gradient-to-br from-blue-50 via-white to-violet-100 flex flex-col">

    {/* Header bar — in the normal flow, not floating */}
    <div className="flex items-center justify-between px-6 py-4">
      <Link href="/">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 shadow-xl border border-slate-200 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-slate-50 hover:shadow-2xl">
          <X className="w-6 h-6 text-slate-700" />
        </div>
      </Link>

      <ModelSelector
        models={models}
        selectedModel={selectedModel}
        onChange={setSelectedModel}
      />
    </div>

    {/* Scrollable messages */}
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-6 pb-32">
        <ChatWindow messages={messages} loading={loading} />
      </div>
    </div>

    {/* Fixed input */}
    <div className="sticky bottom-0 z-40 bg-gradient-to-t from-blue-50 via-white to-transparent">
      <div className="mx-auto max-w-5xl px-6 py-6 space-y-3">
        {error && (
          <div className="max-w-3xl mx-auto rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2">
            {error}
            {models.length > 1 && ' Try switching to another model above.'}
          </div>
        )}
        <ChatInput onSend={sendMessage} />
      </div>
    </div>

  </main>
);
}