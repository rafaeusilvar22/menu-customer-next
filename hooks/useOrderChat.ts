'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { OrderMessage } from '@/types/order';
import { slugApi } from '@/lib/api';

export function useOrderChat(slug: string, order_uuid: string, senderName: string) {
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!order_uuid) return;

    slugApi(slug).getMessages(order_uuid).then((msgs) => {
      setMessages(msgs ?? []);
    });

    const socket = getSocket();
    socket.connect();

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_order', {
        order_uuid,
        sender_type: 'customer',
      });
    });

    socket.on('message_history', (history: OrderMessage[]) => {
      setMessages(history);
    });

    socket.on('message', (msg: OrderMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('order_status_changed', () => {
      queryClient.invalidateQueries({ queryKey: ['order', slug, order_uuid] });
    });

    return () => {
      socket.off('connect');
      socket.off('message_history');
      socket.off('message');
      socket.off('order_status_changed');
      socket.disconnect();
      setConnected(false);
    };
  }, [order_uuid, slug]);

  const sendMessage = useCallback(
    (content: string) => {
      const socket = getSocket();
      socket.emit('send_message', {
        order_uuid,
        content,
        sender_type: 'customer',
        sender_name: senderName,
      });
    },
    [order_uuid, senderName]
  );

  return { messages, connected, sendMessage };
}
