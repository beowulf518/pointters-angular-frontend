import { Media } from './media';

export interface ChatMessageOutgoing {
  conversationId: string;
  userId?: string;
  messageText?: string;
  requestId?: string;
  media?: Array<Media>;
  serviceId?: string;
  offerId?: string;
}
