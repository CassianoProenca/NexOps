import { useState, useEffect, useRef } from 'react'

export interface QueueTicket {
  id: number
  title: string
  type: string
  tier: 'N1' | 'N2' | 'N3'
  minutesInQueue: number
  department: string
}

export interface InProgressTicket {
  id: number
  title: string
  type: string
  tier: 'N1' | 'N2' | 'N3'
  minutesInProgress: number
  department: string
  technicianName: string
  technicianInitials: string
}

const MOCK_WAITING: QueueTicket[] = [
  { id: 1042, title: 'Impressora não responde',          type: 'Impressora', tier: 'N2', minutesInQueue: 14,  department: 'RH' },
  { id: 1043, title: 'Reset de senha SAM',               type: 'Acessos',    tier: 'N1', minutesInQueue: 32,  department: 'Finanças' },
  { id: 1045, title: 'Monitor sem sinal na sala 204',    type: 'Hardware',   tier: 'N1', minutesInQueue: 180, department: 'Educação' },
  { id: 1047, title: 'Excel travando ao abrir planilha', type: 'Software',   tier: 'N1', minutesInQueue: 45,  department: 'Finanças' },
  { id: 1050, title: 'Impressora fiscal offline',        type: 'Impressora', tier: 'N3', minutesInQueue: 310, department: 'Finanças' },
]

const MOCK_IN_PROGRESS: InProgressTicket[] = [
  { id: 1044, title: 'Notebook não liga',              type: 'Hardware', tier: 'N3', minutesInProgress: 25,  department: 'Administração', technicianName: 'Ana Costa',   technicianInitials: 'AC' },
  { id: 1048, title: 'Acesso ao sistema SIAD negado',  type: 'Acessos',  tier: 'N2', minutesInProgress: 50,  department: 'Administração', technicianName: 'Bruno Lima',   technicianInitials: 'BL' },
  { id: 1051, title: 'E-mail institucional não sincroniza', type: 'Software', tier: 'N2', minutesInProgress: 10, department: 'Saúde',   technicianName: 'Carla Dias',   technicianInitials: 'CD' },
]

export function useQueuePanel() {
  const [waiting, setWaiting]       = useState<QueueTicket[]>(MOCK_WAITING)
  const [inProgress, setInProgress] = useState<InProgressTicket[]>(MOCK_IN_PROGRESS)
  const [connected, setConnected]   = useState(false)

  const wsRef        = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function connect() {
      try {
        const ws = new WebSocket('ws://localhost:8080/ws/queue-panel')
        wsRef.current = ws

        ws.onopen = () => setConnected(true)

        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data)
            if (msg.type === 'QUEUE_UPDATE') {
              setWaiting(msg.data.waiting)
              setInProgress(msg.data.inProgress)
            }
          } catch {
            // ignore malformed messages
          }
        }

        ws.onclose = () => {
          setConnected(false)
          reconnectRef.current = setTimeout(connect, 3000)
        }

        ws.onerror = () => ws.close()
      } catch {
        reconnectRef.current = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
      }
    }
  }, [])

  return { waiting, inProgress, connected }
}
