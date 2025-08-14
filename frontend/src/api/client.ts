import axios from 'axios';
import type { Conversation, ProcessedMessage } from '../types';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export const fetchConversations = async () => {
  const { data } = await api.get<Conversation[]>('/conversations');
  return data;
};

export const fetchMessages = async (wa_id: string) => {
  const { data } = await api.get<ProcessedMessage[]>(`/conversations/${wa_id}/messages`);
  return data;
};

export default api;
