import { useState, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAppStore } from '@/store/appStore'
import type { QueuePanelPayload } from '@/types/helpdesk.types'

const EMPTY: QueuePanelPayload = {
  openTickets: [],
  inProgressTickets: [],
  updatedAt: '',
}

/**
 * Hook STOMP para o painel de fila em tempo real.
 *
 * Substitui o hook legado que usava WebSocket nativo.
 * Conecta via SockJS + STOMP ao endpoint /ws do Spring Boot
 * e assina o tópico /topic/queue-panel (broadcast a cada 15 s).
 *
 * Cabeçalhos Authorization e X-Tenant-ID são enviados no frame CONNECT.
 */
export function useQueuePanel() {
  const [data, setData] = useState<QueuePanelPayload>(EMPTY)
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)

  const accessToken = useAppStore((s) => s.accessToken)
  const tenant = useAppStore((s) => s.tenant)

  useEffect(() => {
    const wsUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'}/ws`

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${accessToken ?? ''}`,
      },
      reconnectDelay: 5_000,
      heartbeatIncoming: 4_000,
      heartbeatOutgoing: 4_000,
      onConnect: () => {
        setConnected(true)
        const topic = `/topic/${tenant ?? 'public'}/queue-panel`
        client.subscribe(topic, (message) => {
          try {
            setData(JSON.parse(message.body) as QueuePanelPayload)
          } catch {
            // ignora payload malformado
          }
        })
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [accessToken, tenant])

  return { data, connected }
}
