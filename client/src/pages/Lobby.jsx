// import { useState, useEffect } from 'react'
// import ArticleSearch from '../components/ArticleSearch.jsx'

// export const PLAYER_COLORS = ['#d4380d', '#1a6b3c', '#1d4ed8', '#7c3aed', '#b45309', '#0e7490', '#be185d', '#374151']

// export default function Lobby({ room, myId, countdown, error, onSetArticles, onStart, onLeave }) {
//   const isHost = room.host === myId
//   const hasArticles = room.startArticle && room.endArticle
//   const canStart = hasArticles && room.players.length >= 1

//   const [startArticle, setStartArticle] = useState(room.startArticle || '')
//   const [endArticle, setEndArticle] = useState(room.endArticle || '')
//   const [articleError, setArticleError] = useState('')

//   // Sync local state with room props (important for reset_to_lobby or host changes)
//   useEffect(() => {
//     if (room.startArticle !== undefined) setStartArticle(room.startArticle || '')
//     if (room.endArticle !== undefined) setEndArticle(room.endArticle || '')
//   }, [room.startArticle, room.endArticle])

//   const handleSetArticles = (e) => {
//     e.preventDefault()
//     if (!startArticle || !endArticle) { setArticleError('Please select both articles.'); return }
//     if (startArticle === endArticle) { setArticleError('Start and end must be different.'); return }
//     setArticleError('')
//     onSetArticles({ startArticle, endArticle })
//   }

//   return (
//     <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
//       <header style={{ background: 'var(--ink)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--border)' }}>
//         <h1 style={{ fontFamily: 'var(--display)', fontSize: '2rem', color: 'var(--paper)', letterSpacing: '0.05em' }}>WIKIRACE</h1>
//         <button onClick={onLeave} style={{ background: 'none', border: '1px solid #555', color: '#aaa', padding: '0.4rem 0.85rem', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '12px', letterSpacing: '0.1em' }}>← LEAVE</button>
//       </header>

//       {/* Countdown overlay */}
//       {countdown !== null && (
//         <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
//           <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: '#888', letterSpacing: '0.2em', marginBottom: '1rem' }}>GAME STARTING IN</div>
//           <div style={{ fontFamily: 'var(--display)', fontSize: '10rem', color: 'var(--accent)', letterSpacing: '0.05em', lineHeight: 1, animation: 'fadeUp 0.3s ease' }}>{countdown}</div>
//         </div>
//       )}

//       <div style={{ flex: 1, display: 'flex', gap: 0, maxWidth: 960, margin: '2rem auto', width: '100%', padding: '0 1rem' }}>
//         {/* Left column */}
//         <div style={{ flex: 1, paddingRight: '2.5rem' }}>
//           {/* Room code */}
//           <div style={{ marginBottom: '2rem' }}>
//             <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '0.5rem' }}>ROOM CODE — share with friends</div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
//               <div style={{ fontFamily: 'var(--display)', fontSize: '3.5rem', letterSpacing: '0.2em', color: 'var(--ink)', background: 'white', border: '2px solid var(--border)', borderRadius: 6, padding: '0.5rem 1.25rem', boxShadow: '3px 3px 0 var(--border)' }}>
//                 {room.code}
//               </div>
//               <button onClick={() => navigator.clipboard.writeText(room.code)} style={{ background: 'none', border: '1px solid var(--paper2)', padding: '0.4rem 0.75rem', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.1em' }}>COPY</button>
//             </div>
//           </div>

//           {/* Article selection — host only */}
//           {isHost ? (
//             <div style={{ marginBottom: '2rem' }}>
//               <div style={{ fontFamily: 'var(--mono)', fontSize: '15px', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '0.75rem' }}>SET THE RACE ARTICLES</div>
//               <form onSubmit={handleSetArticles}>
//                 <label style={labelSt}>START ARTICLE</label>
//                 <ArticleSearch placeholder="e.g. Banana" onSelect={setStartArticle} initial={startArticle} />

//                 <label style={{ ...labelSt, marginTop: '0.85rem' }}>TARGET ARTICLE</label>
//                 <ArticleSearch placeholder="e.g. Adolf Hitler" onSelect={setEndArticle} initial={endArticle} />

//                 {articleError && <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent)', marginTop: '0.5rem' }}>{articleError}</div>}

//                 <button type="submit" disabled={!startArticle || !endArticle} style={{ marginTop: '1rem', padding: '0.55rem 1.25rem', background: startArticle && endArticle ? 'var(--accent2)' : 'var(--paper2)', color: startArticle && endArticle ? 'white' : 'var(--muted)', border: 'none', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: '12px', letterSpacing: '0.1em', cursor: startArticle && endArticle ? 'pointer' : 'not-allowed' }}>
//                   {hasArticles ? '✓ UPDATE ARTICLES' : '✓ SET ARTICLES'}
//                 </button>
//               </form>
//             </div>
//           ) : (
//             /* Non-host: just show current articles */
//             <div style={{ marginBottom: '2rem' }}>
//               <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '0.75rem' }}>THE RACE</div>
//               {hasArticles ? (
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
//                   <RouteCard label="START" title={room.startArticle} color="var(--accent2)" />
//                   <div style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', color: 'var(--muted)', textAlign: 'center' }}>↓</div>
//                   <RouteCard label="TARGET" title={room.endArticle} color="var(--accent)" />
//                 </div>
//               ) : (
//                 <div style={{ padding: '1rem', border: '1px dashed var(--paper2)', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--muted)', animation: 'pulse 2s infinite' }}>
//                   Waiting for host to set articles...
//                 </div>
//               )}
//             </div>
//           )}

//           {/* For host: show current articles summary below the form */}
//           {isHost && hasArticles && (
//             <div style={{ marginBottom: '2rem' }}>
//               <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '0.6rem' }}>CURRENT ROUTE</div>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
//                 <RouteCard label="START" title={room.startArticle} color="var(--accent2)" />
//                 <div style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', color: 'var(--muted)', textAlign: 'center' }}>↓</div>
//                 <RouteCard label="TARGET" title={room.endArticle} color="var(--accent)" />
//               </div>
//             </div>
//           )}

//           {error && (
//             <div style={{ background: '#fff0f0', border: '1px solid var(--accent)', borderRadius: 4, padding: '0.75rem', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>
//           )}

//           {isHost ? (
//             <button onClick={onStart} disabled={!canStart} style={{ width: '100%', padding: '1rem', background: canStart ? 'var(--ink)' : 'var(--paper2)', color: canStart ? 'var(--paper)' : 'var(--muted)', border: 'none', borderRadius: 4, fontFamily: 'var(--display)', fontSize: '1.3rem', letterSpacing: '0.1em', cursor: canStart ? 'pointer' : 'not-allowed', boxShadow: canStart ? '3px 3px 0 var(--accent)' : 'none' }}>
//               {!hasArticles ? 'SET ARTICLES FIRST' : '→ START RACE'}
//             </button>
//           ) : (
//             <div style={{ textAlign: 'center', padding: '1rem', border: '1px dashed var(--paper2)', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--muted)', animation: 'pulse 2s infinite' }}>
//               WAITING FOR HOST TO START...
//             </div>
//           )}
//         </div>

//         {/* Right column — players */}
//         <div style={{ width: 240, borderLeft: '1px solid var(--paper2)', paddingLeft: '2rem' }}>
//           <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '1rem' }}>PLAYERS ({room.players.length}/8)</div>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
//             {room.players.map((player, i) => (
//               <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: player.id === myId ? 'var(--paper2)' : 'white', border: `1.5px solid ${player.id === myId ? 'var(--border)' : 'var(--paper2)'}`, borderRadius: 4, animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
//                 <div style={{ width: 28, height: 28, borderRadius: '50%', background: PLAYER_COLORS[i % PLAYER_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: '0.9rem', color: 'white', flexShrink: 0 }}>
//                   {player.name[0].toUpperCase()}
//                 </div>
//                 <div style={{ flex: 1, overflow: 'hidden' }}>
//                   <div style={{ fontWeight: 500, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                     {player.name}
//                     {player.id === myId && <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', marginLeft: '0.4rem' }}>(you)</span>}
//                   </div>
//                 </div>
//                 {room.host === player.id && (
//                   <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--gold)', letterSpacing: '0.1em', background: '#fefce8', border: '1px solid var(--gold)', borderRadius: 3, padding: '1px 5px', flexShrink: 0 }}>HOST</div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// function RouteCard({ label, title, color }) {
//   return (
//     <div style={{ border: `2px solid ${color}`, borderRadius: 6, padding: '0.75rem 1rem', background: 'white' }}>
//       <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.15em', color, marginBottom: '0.25rem' }}>{label}</div>
//       <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--ink)' }}>{title}</div>
//     </div>
//   )
// }

// const labelSt = {
//   display: 'block', fontFamily: 'var(--mono)', fontSize: '11px',
//   letterSpacing: '0.15em', color: 'var(--muted)', marginBottom: '0.4rem',
// }


import { useState, useEffect } from 'react'
import ArticleSearch from '../components/ArticleSearch.jsx'

export const PLAYER_COLORS = ['#d4380d', '#1a6b3c', '#1d4ed8', '#7c3aed', '#b45309', '#0e7490', '#be185d', '#374151']

export default function Lobby({ room, myId, countdown, error, onSetArticles, onStart, onLeave }) {
  const isHost = room.host === myId
  const hasArticles = room.startArticle && room.endArticle
  const canStart = hasArticles && room.players.length >= 1
  const [showPlayers, setShowPlayers] = useState(false)

  const [startArticle, setStartArticle] = useState(room.startArticle || '')
  const [endArticle, setEndArticle] = useState(room.endArticle || '')
  const [articleError, setArticleError] = useState('')

  // Sync local state with room props (important for reset_to_lobby or host changes)
  useEffect(() => {
    if (room.startArticle !== undefined) setStartArticle(room.startArticle || '')
    if (room.endArticle !== undefined) setEndArticle(room.endArticle || '')
  }, [room.startArticle, room.endArticle])

  const handleSetArticles = (e) => {
    e.preventDefault()
    if (!startArticle || !endArticle) { setArticleError('Please select both articles.'); return }
    if (startArticle === endArticle) { setArticleError('Start and end must be different.'); return }
    setArticleError('')
    onSetArticles({ startArticle, endArticle })
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'var(--ink)', padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid var(--border)', gap: '1rem', flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.3rem, 4vw, 2rem)', color: 'var(--paper)', letterSpacing: '0.05em' }}>WIKIRACE</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isMobile && (
            <button onClick={() => setShowPlayers(!showPlayers)} style={{ background: 'none', border: '1px solid #555', color: '#aaa', padding: '0.4rem 0.75rem', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 'clamp(10px, 1.5vw, 12px)', letterSpacing: '0.1em' }}>
              {showPlayers ? '✕ HIDE' : '👥 SHOW'} PLAYERS
            </button>
          )}
          <button onClick={onLeave} style={{ background: 'none', border: '1px solid #555', color: '#aaa', padding: '0.4rem 0.75rem', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 'clamp(10px, 1.5vw, 12px)', letterSpacing: '0.1em' }}>← LEAVE</button>
        </div>
      </header>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(11px, 2vw, 13px)', color: '#888', letterSpacing: '0.2em', marginBottom: '1rem' }}>GAME STARTING IN</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(4rem, 15vw, 10rem)', color: 'var(--accent)', letterSpacing: '0.05em', lineHeight: 1, animation: 'fadeUp 0.3s ease' }}>{countdown}</div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', gap: 0, flexDirection: isMobile ? 'column' : 'row', maxWidth: 960, margin: '0 auto', width: '100%', padding: 'clamp(1rem, 2vw, 2rem) clamp(0.75rem, 2vw, 1rem)' }}>
        {/* Left column */}
        <div style={{ flex: 1, paddingRight: isMobile ? 0 : 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: isMobile ? '1.5rem' : 0 }}>
          {/* Room code */}
          <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(10px, 1.5vw, 11px)', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '0.5rem' }}>ROOM CODE — share with friends</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.75rem, 2vw, 1rem)', flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.2em', color: 'var(--ink)', background: 'white', border: '2px solid var(--border)', borderRadius: 6, padding: 'clamp(0.4rem, 1vw, 0.5rem) clamp(0.75rem, 2vw, 1.25rem)', boxShadow: '3px 3px 0 var(--border)' }}>
                {room.code}
              </div>
              <button onClick={() => navigator.clipboard.writeText(room.code)} style={{ background: 'none', border: '1px solid var(--paper2)', padding: '0.4rem 0.75rem', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 'clamp(10px, 1.5vw, 11px)', color: 'var(--muted)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>COPY</button>
            </div>
          </div>

          {/* Article selection — host only */}
          {isHost ? (
            <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(10px, 1.5vw, 11px)', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '0.75rem' }}>SET THE RACE ARTICLES</div>
              <form onSubmit={handleSetArticles}>
                <label style={labelSt}>START ARTICLE</label>
                <ArticleSearch placeholder="e.g. Banana" onSelect={setStartArticle} initial={startArticle} />

                <label style={{ ...labelSt, marginTop: '0.85rem' }}>TARGET ARTICLE</label>
                <ArticleSearch placeholder="e.g. Adolf Hitler" onSelect={setEndArticle} initial={endArticle} />

                {articleError && <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(11px, 1.5vw, 12px)', color: 'var(--accent)', marginTop: '0.5rem' }}>{articleError}</div>}

                <button type="submit" disabled={!startArticle || !endArticle} style={{ marginTop: '1rem', padding: 'clamp(0.5rem, 1vw, 0.55rem) clamp(0.85rem, 2vw, 1.25rem)', background: startArticle && endArticle ? 'var(--accent2)' : 'var(--paper2)', color: startArticle && endArticle ? 'white' : 'var(--muted)', border: 'none', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 'clamp(11px, 1.5vw, 12px)', letterSpacing: '0.1em', cursor: startArticle && endArticle ? 'pointer' : 'not-allowed', width: '100%' }}>
                  {hasArticles ? '✓ UPDATE ARTICLES' : '✓ SET ARTICLES'}
                </button>
              </form>
            </div>
          ) : (
            /* Non-host: just show current articles */
            <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(10px, 1.5vw, 11px)', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '0.75rem' }}>THE RACE</div>
              {hasArticles ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <RouteCard label="START" title={room.startArticle} color="var(--accent2)" />
                  <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', color: 'var(--muted)', textAlign: 'center' }}>↓</div>
                  <RouteCard label="TARGET" title={room.endArticle} color="var(--accent)" />
                </div>
              ) : (
                <div style={{ padding: 'clamp(0.75rem, 1.5vw, 1rem)', border: '1px dashed var(--paper2)', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 'clamp(12px, 1.8vw, 13px)', color: 'var(--muted)', animation: 'pulse 2s infinite' }}>
                  Waiting for host to set articles...
                </div>
              )}
            </div>
          )}

          {/* For host: show current articles summary below the form */}
          {isHost && hasArticles && (
            <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(10px, 1.5vw, 11px)', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '0.6rem' }}>CURRENT ROUTE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <RouteCard label="START" title={room.startArticle} color="var(--accent2)" />
                <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', color: 'var(--muted)', textAlign: 'center' }}>↓</div>
                <RouteCard label="TARGET" title={room.endArticle} color="var(--accent)" />
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid var(--accent)', borderRadius: 4, padding: 'clamp(0.5rem, 1vw, 0.75rem)', fontFamily: 'var(--mono)', fontSize: 'clamp(11px, 1.5vw, 13px)', color: 'var(--accent)', marginBottom: '1rem' }}>{error}</div>
          )}

          {isHost ? (
            <button onClick={onStart} disabled={!canStart} style={{ width: '100%', padding: 'clamp(0.75rem, 1.5vw, 1rem)', background: canStart ? 'var(--ink)' : 'var(--paper2)', color: canStart ? 'var(--paper)' : 'var(--muted)', border: 'none', borderRadius: 4, fontFamily: 'var(--display)', fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', letterSpacing: '0.1em', cursor: canStart ? 'pointer' : 'not-allowed', boxShadow: canStart ? '3px 3px 0 var(--accent)' : 'none' }}>
              {!hasArticles ? 'SET ARTICLES FIRST' : '→ START RACE'}
            </button>
          ) : (
            <div style={{ textAlign: 'center', padding: 'clamp(0.75rem, 1.5vw, 1rem)', border: '1px dashed var(--paper2)', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 'clamp(12px, 1.8vw, 13px)', color: 'var(--muted)', animation: 'pulse 2s infinite' }}>
              WAITING FOR HOST TO START...
            </div>
          )}
        </div>

        {/* Right column — players (collapsible on mobile) */}
        {(!isMobile || showPlayers) && (
          <div style={{ width: isMobile ? '100%' : 240, borderLeft: isMobile ? 'none' : '1px solid var(--paper2)', borderTop: isMobile ? '1px solid var(--paper2)' : 'none', paddingLeft: isMobile ? 0 : 'clamp(1.5rem, 3vw, 2rem)', paddingTop: isMobile ? 'clamp(1rem, 2vw, 1.5rem)' : 0 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(10px, 1.5vw, 11px)', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: '1rem' }}>PLAYERS ({room.players.length}/8)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: isMobile ? 'none' : '60vh', overflowY: 'auto' }}>
              {room.players.map((player, i) => (
                <div key={player.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: 'clamp(0.4rem, 1vw, 0.6rem) clamp(0.5rem, 1vw, 0.85rem)', background: player.id === myId ? 'var(--paper2)' : 'white', border: `1.5px solid ${player.id === myId ? 'var(--border)' : 'var(--paper2)'}`, borderRadius: 4, animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: PLAYER_COLORS[i % PLAYER_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: '0.9rem', color: 'white', flexShrink: 0 }}>
                    {player.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 'clamp(13px, 1.8vw, 14px)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {player.name}
                      {player.id === myId && <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', marginLeft: '0.4rem' }}>(you)</span>}
                    </div>
                  </div>
                  {room.host === player.id && (
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--gold)', letterSpacing: '0.1em', background: '#fefce8', border: '1px solid var(--gold)', borderRadius: 3, padding: '1px 5px', flexShrink: 0, whiteSpace: 'nowrap' }}>HOST</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RouteCard({ label, title, color }) {
  return (
    <div style={{ border: `2px solid ${color}`, borderRadius: 6, padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(0.75rem, 1.5vw, 1rem)', background: 'white' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(9px, 1.5vw, 10px)', letterSpacing: '0.15em', color, marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: 'clamp(14px, 2vw, 16px)', color: 'var(--ink)', wordBreak: 'break-word' }}>{title}</div>
    </div>
  )
}

const labelSt = {
  display: 'block', fontFamily: 'var(--mono)', fontSize: 'clamp(10px, 1.5vw, 11px)',
  letterSpacing: '0.15em', color: 'var(--muted)', marginBottom: '0.4rem',
}
