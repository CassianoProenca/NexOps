import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export function createStompClient(token: string): Client {
  return new Client({
    webSocketFactory: () => new SockJS(`${BASE_URL}/ws`) as WebSocket,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5_000,
  })
}
