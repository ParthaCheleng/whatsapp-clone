export type MsgStatus = 'sent' | 'delivered' | 'read' | 'failed' | null;

export interface ProcessedMessage {
  _id: string;
  message_id?: string | null;
  meta_msg_id?: string | null;
  wa_id: string;
  name?: string | null;
  direction: 'incoming' | 'outgoing';
  type: 'text' | 'image' | 'audio' | 'document' | 'sticker' | 'unknown';
  text?: string | null;
  media?: { mime?: string; url?: string; caption?: string } | null;
  timestamp: string | Date;
  status: MsgStatus;
}

export interface Conversation {
  wa_id: string;
  name?: string | null;
  last_updated_at?: string | Date;
}
