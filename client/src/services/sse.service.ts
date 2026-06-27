import { API_URL } from '../lib/api';

export interface NewPromoEvent {
  type: 'nova_promocao';
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  salePrice: number;
  store: string;
  publishedAt: string;
}

export interface HotDealEvent {
  type: 'hot_deal';
  title: string;
  category: string;
  score: number;
}

export interface SseHandlers {
  onNewPromo?: (data: NewPromoEvent) => void;
  onHotDeal?: (data: HotDealEvent) => void;
}

/**
 * Abre uma conexão SSE com o ms-gateway para o cliente informado.
 * O servidor só envia eventos das categorias em que o cliente tem interesse,
 * então uma única conexão já reflete novas inscrições sem precisar reconectar.
 * Retorna uma função para encerrar a conexão.
 */
export function connectNotifications(clientId: string, handlers: SseHandlers): () => void {
  const source = new EventSource(`${API_URL}/sse/${encodeURIComponent(clientId)}`);

  source.addEventListener('notification', (e) => {
    try {
      handlers.onNewPromo?.(JSON.parse((e as MessageEvent).data));
    } catch (err) {
      console.error('Notificação SSE inválida', err);
    }
  });

  source.addEventListener('hot_deal', (e) => {
    try {
      handlers.onHotDeal?.(JSON.parse((e as MessageEvent).data));
    } catch (err) {
      console.error('Hot deal SSE inválido', err);
    }
  });

  // EventSource reconecta sozinho em caso de queda; só logamos.
  source.onerror = () => console.warn('Conexão SSE interrompida, tentando reconectar...');

  return () => source.close();
}
