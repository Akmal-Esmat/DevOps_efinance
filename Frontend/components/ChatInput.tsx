'use client';

import { useState } from 'react';

export function ChatInput({
  onSend,
}: {
  onSend: (text: string) => void;
}) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    onSend(input);
    setInput('');
  };

  return (
    <div
      className="
        z-50
        w-full
        max-w-3xl
        mx-auto
        flex
        items-center
        gap-3
        rounded-2xl
        bg-slate-50/95
        border
        border-slate-200
        p-3
        shadow-2xl
        backdrop-blur-md
      "
    >
      <input
        className="
          flex-1
          rounded-xl
          bg-transparent
          px-4
          py-3
          text-slate-800
          placeholder:text-slate-400
          outline-none
        "
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Message your AI assistant..."
      />

      <button
        onClick={handleSend}
        className="
          rounded-xl
          bg-gradient-to-r
          from-blue-600
          to-violet-600
          px-6
          py-3
          font-semibold
          text-white
          shadow-lg
          transition-all
          duration-300
          hover:scale-105
          hover:shadow-2xl
          hover:from-blue-700
          hover:to-violet-700
          active:scale-95
        "
      >
        Send
      </button>
    </div>
  );
}