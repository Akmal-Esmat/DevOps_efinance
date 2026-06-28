import { useState } from 'react';
import { sendChatMessage } from '@/lib/api';

export interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (input: string) => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setLoading(true);

    const reply = await sendChatMessage(input);
    setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    setLoading(false);
  };

  return { messages, loading, sendMessage };
}