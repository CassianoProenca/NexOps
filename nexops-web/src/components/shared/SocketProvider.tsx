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
  const clientRef = useRef<Client | null>(null)
  
  const accessToken = useAppStore(s => s.accessToken)
  const tenant = useAppStore(s => s.tenant)

  useEffect(() => {
    // Só conecta se houver token
    if (!accessToken) {
      if (clientRef.current) {
        clientRef.current.deactivate()
        clientRef.current = null
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

    return () => {
      // Opcional: Desativar ao deslogar. Aqui mantemos enquanto o componente estiver montado
      // mas como ele envolve o App, só desativa no refresh total ou logout (devido ao check do accessToken)
    }
  }, [accessToken])

  return (
    <SocketContext.Provider value={{ client: clientRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
