import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import Home from './pages/Home.jsx'
import Lobby from './pages/Lobby.jsx'
import Game from './pages/Game.jsx'
import Results from './pages/Results.jsx'
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'


export default function App() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [page, setPage] = useState('home') // home | lobby | game | results
  const [room, setRoom] = useState(null)
  const [myId, setMyId] = useState(null)
  const [error, setError] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [finalPlayers, setFinalPlayers] = useState(null)

  useEffect(() => {
    const socket = io(SERVER_URL)
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      setMyId(socket.id)
    })
    socket.on('disconnect', () => setConnected(false))
    socket.on('connect_error', () => setError('Cannot connect to server. Make sure the server is running.'))

    socket.on('error', ({ message }) => setError(message))

    socket.on('room_created', ({ code, room }) => {
      setRoom(room)
      setPage('lobby')
      setError(null)
    })

    socket.on('room_joined', ({ room }) => {
      setRoom(room)
      setPage('lobby')
      setError(null)
    })

    socket.on('articles_set', ({ startArticle, endArticle, room }) => {
      setRoom(room)
    })

    socket.on('player_joined', ({ players }) => {
      setRoom(prev => prev ? { ...prev, players } : prev)
    })

    socket.on('player_left', ({ players }) => {
      setRoom(prev => prev ? { ...prev, players } : prev)
    })

    socket.on('host_changed', ({ newHostId }) => {
      setRoom(prev => prev ? { ...prev, host: newHostId } : prev)
    })

    socket.on('countdown_start', ({ seconds }) => {
      setCountdown(seconds)
    })

    socket.on('countdown_tick', ({ seconds }) => {
      setCountdown(seconds)
    })

    socket.on('game_start', ({ startArticle, endArticle, startedAt }) => {
      setCountdown(null)
      setRoom(prev => prev ? { ...prev, state: 'playing', startedAt } : prev)
      setPage('game')
    })

    socket.on('player_navigated', ({ players }) => {
      setRoom(prev => prev ? { ...prev, players } : prev)
    })

    socket.on('player_finished', ({ players }) => {
      setRoom(prev => prev ? { ...prev, players } : prev)
    })

    socket.on('player_gave_up', ({ players }) => {
      setRoom(prev => prev ? { ...prev, players } : prev)
    })

    socket.on('game_over', ({ players }) => {
      setFinalPlayers(players)
      setPage('results')
    })

    socket.on('reset_to_lobby', ({ room }) => {
      setRoom(room)
      setFinalPlayers(null)
      setPage('lobby')
    })

    return () => socket.disconnect()
  }, [])

  const socket = socketRef.current

  const handleCreateRoom = ({ playerName }) => {
    setError(null)
    socket?.emit('create_room', { playerName })
  }

  const handleSetArticles = ({ startArticle, endArticle }) => {
    setError(null)
    socket?.emit('set_articles', { startArticle, endArticle })
  }

  const handleJoinRoom = ({ playerName, code }) => {
    setError(null)
    socket?.emit('join_room', { playerName, code })
  }

  const handleStartGame = () => {
    socket?.emit('start_game')
  }

  const handleNavigate = (articleTitle) => {
    socket?.emit('navigate', { articleTitle })
  }

  const handleGiveUp = () => {
    socket?.emit('give_up')
  }

  const handlePlayAgain = () => {
    socket?.emit('play_again')
  }

  const handleGoHome = () => {
    setPage('home')
    setRoom(null)
    setFinalPlayers(null)
    setError(null)
    setCountdown(null)
  }

  return (
    <div>
      {page === 'home' && (
        <Home
          connected={connected}
          error={error}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onClearError={() => setError(null)}
        />
      )}
      {page === 'lobby' && room && (
        <Lobby
          room={room}
          myId={myId}
          countdown={countdown}
          error={error}
          onSetArticles={handleSetArticles}
          onStart={handleStartGame}
          onLeave={handleGoHome}
        />
      )}
      {page === 'game' && room && (
        <Game
          room={room}
          myId={myId}
          onNavigate={handleNavigate}
          onGiveUp={handleGiveUp}
        />
      )}
      {page === 'results' && room && (
        <Results
          room={room}
          myId={myId}
          finalPlayers={finalPlayers}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          isHost={room.host === myId}
        />
      )}

    </div>
  )
}
