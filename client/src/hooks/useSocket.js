import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SERVER_URL =
    import.meta.env.VITE_SERVER_URL || 'https://ahmed.hackclub.app'

export function useSocket() {
    const socketRef = useRef(null)
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        // Added the specific transport and credential settings here!
        const socket = io(SERVER_URL, {
            autoConnect: true,
            withCredentials: true,
            transports: ['websocket', 'polling']
        })

        socketRef.current = socket

        socket.on('connect', () => setConnected(true))
        socket.on('disconnect', () => setConnected(false))

        return () => socket.disconnect()
    }, [])

    return { socket: socketRef.current, connected }
}