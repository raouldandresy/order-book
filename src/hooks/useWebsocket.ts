import { useState, useEffect, useRef, useCallback } from 'react';
import { Order } from '../models/Order';
import { Precision } from '../models/Precision';

function useWebsocket(precision: Precision) {
  const [orderBook, setOrderBook] = useState<{ bids: Order[]; asks: Order[] }>({ bids: [], asks: [] });
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const channelId = useRef<number | null>(null);

  const MAX_RECONNECT_ATTEMPTS = 10;
  const RECONNECT_INTERVAL = 3000; 

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    ws.current = new WebSocket('wss://api-pub.bitfinex.com/ws/2');

    const msg = JSON.stringify({
      event: 'subscribe',
      channel: 'book',
      symbol: 'tBTCUSD',
      freq: 'F0',
      prec: precision,
    });

    ws.current.onopen = () => {
      reconnectAttempts.current = 0; 
      ws.current?.send(msg);
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.event === 'subscribed') {
        channelId.current = msg.chanId;
        return;
      }
      if (msg.event === 'info' || msg[1] === 'hb') return;

      const data = msg[1];

      if (Array.isArray(data[0])) {
        const bids: Order[] = [];
        const asks: Order[] = [];

        data.forEach(([price, count, amount]: [number, number, number]) => {
          const order: Order = { price, count, amount: Math.abs(amount) };
          if (amount > 0) bids.push(order);
          else asks.push(order);
        });

        setOrderBook({ bids, asks });
      } else {
        const [price, count, amount] = data;
        setOrderBook((prev) => {
          const side = amount >= 0 ? 'bids' : 'asks';
          const updated = [...prev[side]];
          const index = updated.findIndex((o) => o.price === price);

          if (count === 0) {
            if (index !== -1) updated.splice(index, 1);
          } else {
            const order: Order = { price, count, amount: Math.abs(amount) };
            if (index !== -1) updated[index] = order;
            else updated.push(order);
          }

          return {
            ...prev,
            [side]: updated.sort((a, b) => (side === 'bids' ? b.price - a.price : a.price - b.price)),
          };
        });
      }
    };

    ws.current.onerror = (e) => {
      console.error('WebSocket error:', e);
      setIsConnected(false);
      attemptReconnect();
    };

    ws.current.onclose = (e) => {
      console.log('WebSocket closed', e.reason);
      setIsConnected(false);
      attemptReconnect();
    };
  }, [precision]);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
      const timeout = RECONNECT_INTERVAL * (reconnectAttempts.current + 1); 
      reconnectTimeout.current = setTimeout(() => {
        reconnectAttempts.current += 1;
        connect();
      }, timeout);
    } else {
      console.warn('Max reconnect attempts reached');
    }
  }, [connect]);

  const close = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    ws.current?.close();
    ws.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      close();
    };
  }, [connect, close, precision]);

  return { orderBook, isConnected, connect, close };
}

export default useWebsocket;
