import { useState } from 'react'

export default function Home({ connected, error, onCreateRoom, onJoinRoom, onClearError }) {
  const [tab, setTab] = useState('create')
  const [playerName, setPlayerName] = useState('')
  const [joinCode, setJoinCode] = useState('')

  const handleCreate = (e) => {
    e.preventDefault()
    if (!playerName.trim()) return
    onCreateRoom({ playerName: playerName.trim() })
  }

  const handleJoin = (e) => {
    e.preventDefault()
    if (!playerName.trim() || !joinCode.trim()) return
    onJoinRoom({ playerName: playerName.trim(), code: joinCode.trim().toUpperCase() })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '3px solid var(--border)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ink)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: '2.5rem', color: 'var(--paper)', letterSpacing: '0.05em', lineHeight: 1 }}>WIKIRACE</h1>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#888', letterSpacing: '0.1em' }}>v1.0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#4ade80' : '#ef4444' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: connected ? '#4ade80' : '#ef4444' }}>{connected ? 'CONNECTED' : 'OFFLINE'}</span>
        </div>
      </header>

      <div style={{ background: 'var(--ink)', padding: '3rem 2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.3em', color: 'var(--accent)', marginBottom: '1rem' }}>MULTIPLAYER · REAL-TIME · BROWSER GAME</p>
        <h2 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2rem, 6vw, 4rem)', color: 'var(--paper)', letterSpacing: '0.05em', lineHeight: 1.1, marginBottom: '1rem' }}>RACE THROUGH<br />WIKIPEDIA</h2>
        <p style={{ color: '#aaa', maxWidth: 480, margin: '0 auto', fontSize: '15px', lineHeight: 1.7 }}>Start at one article. Navigate to the target using only Wikipedia links. First to arrive wins.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2rem' }}>
          {[['UP TO', '8 PLAYERS'], ['NO', 'INSTALL'], ['100%', 'FREE']].map(([label, val]) => (
            <div key={val}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#666', letterSpacing: '0.15em' }}>{label}</div>
              <div style={{ fontFamily: 'var(--display)', fontSize: '1.4rem', color: 'var(--accent)' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2.5rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: 460, animation: 'fadeUp 0.4s ease' }}>
          {error && (
            <div style={{ background: '#fff0f0', border: '1.5px solid var(--accent)', borderRadius: 4, padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--accent)' }}>
              {error}
              <button onClick={onClearError} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '18px' }}>×</button>
            </div>
          )}

          <div style={{ background: 'white', border: '2px solid var(--border)', borderRadius: 6, overflow: 'hidden', boxShadow: '4px 4px 0 var(--border)' }}>
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border)' }}>
              {[['create', 'CREATE ROOM'], ['join', 'JOIN ROOM']].map(([key, label]) => (
                <button key={key} onClick={() => { setTab(key); onClearError() }} style={{ flex: 1, padding: '1rem', fontFamily: 'var(--display)', fontSize: '1.1rem', letterSpacing: '0.05em', border: 'none', borderBottom: tab === key ? '3px solid var(--accent)' : '3px solid transparent', background: tab === key ? 'var(--paper)' : 'white', color: tab === key ? 'var(--ink)' : 'var(--muted)', cursor: 'pointer', marginBottom: '-2px' }}>{label}</button>
              ))}
            </div>

            <div style={{ padding: '1.75rem' }}>
              <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.15em', color: 'var(--muted)', marginBottom: '0.4rem' }}>YOUR NAME</label>
              <input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Enter your name" maxLength={20} autoFocus style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--paper2)', borderRadius: 4, fontSize: '15px', fontFamily: 'var(--sans)', background: 'var(--paper)', color: 'var(--ink)', outline: 'none' }} />

              {tab === 'create' ? (
                <form onSubmit={handleCreate}>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted)', marginTop: '1.25rem', lineHeight: 1.6 }}>You will pick the start and target articles inside the room lobby.</p>
                  <button type="submit" disabled={!playerName.trim() || !connected} style={{ display: 'block', width: '100%', marginTop: '1.5rem', padding: '0.85rem', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 4, fontFamily: 'var(--display)', fontSize: '1.1rem', letterSpacing: '0.1em', cursor: 'pointer' }}>→ CREATE ROOM</button>
                </form>
              ) : (
                <form onSubmit={handleJoin}>
                  <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.15em', color: 'var(--muted)', marginBottom: '0.4rem', marginTop: '1.25rem' }}>ROOM CODE</label>
                  <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="" maxLength={6} style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid var(--paper2)', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: '1.4rem', letterSpacing: '0.25em', background: 'var(--paper)', color: 'var(--ink)', outline: 'none' }} />
                  <button type="submit" disabled={!playerName.trim() || joinCode.length < 6 || !connected} style={{ display: 'block', width: '100%', marginTop: '1.5rem', padding: '0.85rem', background: 'var(--accent2)', color: 'white', border: 'none', borderRadius: 4, fontFamily: 'var(--display)', fontSize: '1.1rem', letterSpacing: '0.1em', cursor: 'pointer' }}>→ JOIN ROOM</button>
                </form>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1.25rem', border: '1px solid var(--paper2)', borderRadius: 4, background: 'var(--paper2)' }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: '1rem', letterSpacing: '0.1em', marginBottom: '0.75rem', color: 'var(--muted)' }}>HOW TO PLAY</div>
            {['Host creates a room.', 'Share the 6-letter code with friends so they can join', 'Host picks the start and target articles in the lobby' , 'Everyone navigates Wikipedia by clicking article links', 'First to reach the target article wins!'].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '14px', color: 'var(--ink)', marginBottom: '0.4rem' }}>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontWeight: 500, flexShrink: 0 }}>{i + 1}.</span>{tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
