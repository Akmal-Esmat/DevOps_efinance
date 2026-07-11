import { useEffect, useState } from 'react';
import { fetchModels, sendChatMessage, ModelOption } from '@/lib/api';

export interface Message {
  role: 'user' | 'assistant';
  text: string;
  fallbackNotice?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModels()
      .then(({ models, default: defaultModel }) => {
        setModels(models);
        setSelectedModel(defaultModel);
      })
      .catch(() => {});
  }, []);

  const sendMessage = async (input: string) => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setLoading(true);
    setError(null);

    try {
      const { response, model, requestedModel, fallback } = await sendChatMessage(input, selectedModel);
      const fallbackNotice = fallback
        ? `${labelFor(models, requestedModel)} was busy, so this reply used ${labelFor(models, model)} instead.`
        : undefined;
      setMessages(prev => [...prev, { role: 'assistant', text: response, fallbackNotice }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try another model.');
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sendMessage, models, selectedModel, setSelectedModel, error };
}

function labelFor(models: ModelOption[], id: string): string {
  return models.find(m => m.id === id)?.label ?? id;
}