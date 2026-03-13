import { useState, useEffect, useCallback } from 'react'
import { useSocket } from '@/components/shared/SocketProvider'
import type { ChatMessageResponse, ChatMessageRequest } from '@/types/helpdesk.types'

/**
 * Hook que utiliza a conexão global STOMP para o chat.
 */
export function useTicketChat(ticketId: string) {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([])
  const { client, isConnected } = useSocket()

  useEffect(() => {
    if (!ticketId || !client || !isConnected) return

    console.log('STOMP: Subscribing to ticket chat:', ticketId)
    
    const subscription = client.subscribe(`/topic/ticket/${ticketId}/chat`, (message) => {
      try {
        const msg = JSON.parse(message.body) as ChatMessageResponse
        setMessages((prev) => [...prev, msg])
      } catch (err) {
        console.error('STOMP: Chat parse error:', err)
      }
    })

    return () => {
      console.log('STOMP: Unsubscribing from ticket chat:', ticketId)
      subscription.unsubscribe()
    }
  }, [ticketId, client, isConnected])

  const sendMessage = useCallback(
    (content: string) => {
      if (!client || !isConnected) return
      const payload: ChatMessageRequest = { content }
      client.publish({
        destination: `/app/ticket/${ticketId}/chat`,
        body: JSON.stringify(payload),
      })
    },
    [ticketId, client, isConnected],
  )

  return { messages, connected: isConnected, sendMessage }
}
