import { useState, useEffect } from 'react'
import { useSocket } from '@/components/shared/SocketProvider'
import { useAppStore } from '@/store/appStore'
import { helpdeskService } from '@/services/helpdesk.service'
import type { QueuePanelPayload } from '@/types/helpdesk.types'

const EMPTY: QueuePanelPayload = {
  openTickets: [],
  inProgressTickets: [],
  updatedAt: '',
}

/**
 * Hook que utiliza a conexão global STOMP para o painel de fila.
 */
export function useQueuePanel() {
  const [data, setData] = useState<QueuePanelPayload>(EMPTY)
  const [isLoading, setIsLoading] = useState(true)
  const { client, isConnected } = useSocket()
  const tenant = useAppStore((s) => s.tenant)

  // 1. Busca inicial imediata via HTTP
  useEffect(() => {
    let mounted = true
    
    helpdeskService.getQueuePanel()
      .then(res => {
        if (mounted) {
          setData(res)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false)
      })

    return () => { mounted = false }
  }, [])

  // 2. Subscrição em tempo real via Socket
  useEffect(() => {
    if (!client || !isConnected) return

    const topic = `/topic/${tenant ?? 'public'}/queue-panel`
    console.log('STOMP: Subscribing to queue panel:', topic)

    const subscription = client.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body) as QueuePanelPayload
        setData(payload)
      } catch (err) {
        console.error('STOMP: Queue panel parse error:', err)
      }
    })

    return () => {
      console.log('STOMP: Unsubscribing from queue panel')
      subscription.unsubscribe()
    }
  }, [client, isConnected, tenant])

  return { data, connected: isConnected, isLoading }
}
