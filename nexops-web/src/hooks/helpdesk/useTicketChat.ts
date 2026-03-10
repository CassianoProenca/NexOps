import { useState, useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAppStore } from '@/store/appStore'
import type { ChatMessageResponse, ChatMessageRequest } from '@/types/helpdesk.types'

/**
 * Hook STOMP para o chat em tempo real de um ticket.
 *
 * Assina /topic/ticket/{ticketId}/chat e publica em /app/ticket/{ticketId}/chat.
 */
export function useTicketChat(ticketId: string) {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([])
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)

  const accessToken = useAppStore((s) => s.accessToken)
  const tenant = useAppStore((s) => s.tenant)

  useEffect(() => {
    if (!ticketId) return

    const wsUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'}/ws`

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${accessToken ?? ''}`,
        'X-Tenant-ID': tenant ?? '',
      },
      reconnectDelay: 5_000,
      heartbeatIncoming: 4_000,
      heartbeatOutgoing: 4_000,
      onConnect: () => {
        setConnected(true)
        client.subscribe(`/topic/ticket/${ticketId}/chat`, (message) => {
          try {
            const msg = JSON.parse(message.body) as ChatMessageResponse
            setMessages((prev) => [...prev, msg])
          } catch {
            // ignora payload malformado
          }
        })
      },
      onDisconnect: () => setConnected(false),
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [ticketId, accessToken, tenant])

  /** Publica mensagem no destino STOMP /app/ticket/{ticketId}/chat */
  const sendMessage = useCallback(
    (content: string) => {
      const payload: ChatMessageRequest = { content }
      clientRef.current?.publish({
        destination: `/app/ticket/${ticketId}/chat`,
        body: JSON.stringify(payload),
      })
    },
    [ticketId],
  )

  return { messages, connected, sendMessage }
}
