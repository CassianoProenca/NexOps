import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAppStore } from '@/store/appStore'

interface SocketContextType {
  client: Client | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({ client: null, isConnected: false })

export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [clientInstance, setClientInstance] = useState<Client | null>(null)
  const clientRef = useRef<Client | null>(null)
  
  const accessToken = useAppStore(s => s.accessToken)

  useEffect(() => {
    // Só conecta se houver token
    if (!accessToken) {
      if (clientRef.current) {
        clientRef.current.deactivate()
        clientRef.current = null
        setClientInstance(null)
        setIsConnected(false)
      }
      return
    }

    const wsUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/ws`
    
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('STOMP: Global connection established')
        setIsConnected(true)
      },
      onDisconnect: () => {
        console.log('STOMP: Global connection lost')
        setIsConnected(false)
      },
      onStompError: (frame) => {
        console.error('STOMP: Broker error', frame.headers['message'])
        setIsConnected(false)
      },
    })

    client.activate()
    clientRef.current = client
    setClientInstance(client)

    return () => {
      // Mantemos a conexão ativa enquanto o provider existir
    }
  }, [accessToken])

  return (
    <SocketContext.Provider value={{ client: clientInstance, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
