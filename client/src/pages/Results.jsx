import { PLAYER_COLORS } from './Lobby.jsx'

export default function Results({ room, myId, finalPlayers, onPlayAgain, onGoHome, isHost }) {
  const players = finalPlayers || room.players

  const formatTime = (ms) => {
    if (!ms) return '—'
    const s = Math.floor(ms / 1000)
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  const winner = players.find(p => p.place === 1 && !p.gaveUp)
  const myResult = players.find(p => p.id === myId)

  const sorted = [...players].sort((a, b) => {
    if (a.place && b.place && !a.gaveUp && !b.gaveUp) return a.place - b.place
    if (a.place && !a.gaveUp) return -1
    if (b.place && !b.gaveUp) return 1
    return b.clickCount - a.clickCount
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: 'var(--ink)', padding: '1rem 2rem', borderBottom: '3px solid var(--border)' }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: '2rem', color: 'var(--paper)', letterSpacing: '0.05em' }}>WIKIRACE</h1>
      </header>

      <div style={{ flex: 1, maxWidth: 700, margin: '0 auto', width: '100%', padding: '2.5rem 1rem' }}>
        {/* Winner banner */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', animation: 'fadeUp 0.4s ease' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>RACE COMPLETE</div>
          {winner ? (
            <>
              <h2 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2.5rem, 8vw, 5rem)', letterSpacing: '0.05em', color: 'var(--ink)', lineHeight: 1 }}>
                {winner.name.toUpperCase()}
              </h2>
              <p style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--accent)', marginTop: '0.25rem', letterSpacing: '0.1em' }}>WINS THE RACE</p>
            </>
          ) : (
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '3rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>NO WINNER</h2>
          )}
        </div>

        {/* Route recap */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '1rem', marginBottom: '2rem', padding: '1rem',
          background: 'white', border: '1.5px solid var(--paper2)', borderRadius: 6,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', marginBottom: '0.25rem' }}>START</div>
            <div style={{ fontWeight: 600, fontSize: '15px' }}>{room.startArticle}</div>
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', color: 'var(--muted)' }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', marginBottom: '0.25rem' }}>TARGET</div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--accent)' }}>{room.endArticle}</div>
          </div>
        </div>

        {/* Leaderboard */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '1rem' }}>FINAL STANDINGS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sorted.map((player, i) => {
              const colorIdx = room.players.findIndex(p => p.id === player.id)
              const isMe = player.id === myId
              const finishTime = player.finishedAt && room.startedAt ? player.finishedAt - room.startedAt : null
              const placeLabel = player.gaveUp ? 'DNF' : player.place ? `#${player.place}` : '—'

              return (
                <div key={player.id} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.85rem 1rem',
                  background: isMe ? 'var(--paper2)' : 'white',
                  border: `1.5px solid ${i === 0 && !player.gaveUp ? 'var(--accent)' : 'var(--paper2)'}`,
                  borderRadius: 6,
                  animation: `fadeUp 0.3s ease ${i * 0.07}s both`,
                }}>
                  {/* Place */}
                  <div style={{
                    fontFamily: 'var(--display)', fontSize: '1.8rem', color: i === 0 && !player.gaveUp ? 'var(--accent)' : 'var(--paper2)',
                    width: 48, textAlign: 'center', flexShrink: 0,
                    letterSpacing: '0.05em',
                  }}>
                    {placeLabel}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: PLAYER_COLORS[colorIdx % PLAYER_COLORS.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--display)', fontSize: '1rem', color: 'white',
                  }}>
                    {player.name[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>
                      {player.name}
                      {isMe && <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginLeft: '0.4rem' }}>(you)</span>}
                    </div>
                    {player.path && player.path.length > 1 && (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginTop: '0.2rem' }}>
                        {player.path.slice(0, 5).join(' → ')}{player.path.length > 5 ? ` → +${player.path.length - 5} more` : ''}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 500 }}>{player.clickCount} clicks</div>
                    {finishTime && (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)' }}>{formatTime(finishTime)}</div>
                    )}
                    {player.gaveUp && (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)' }}>gave up</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isHost ? (
            <button
              onClick={onPlayAgain}
              style={{
                flex: 2, padding: '0.85rem', background: 'var(--ink)', color: 'var(--paper)',
                border: 'none', borderRadius: 4, fontFamily: 'var(--display)', fontSize: '1.2rem',
                letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '3px 3px 0 var(--accent)',
              }}
            >
              → PLAY AGAIN
            </button>
          ) : (
            <div style={{ flex: 2, padding: '0.85rem', textAlign: 'center', border: '1px dashed var(--paper2)', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--muted)' }}>
              Waiting for host to start again...
            </div>
          )}
          <button
            onClick={onGoHome}
            style={{
              flex: 1, padding: '0.85rem', background: 'none', color: 'var(--muted)',
              border: '1.5px solid var(--paper2)', borderRadius: 4, fontFamily: 'var(--mono)',
              fontSize: '12px', letterSpacing: '0.1em', cursor: 'pointer',
            }}
          >
            HOME
          </button>
        </div>
      </div>
    </div>
  )
}
