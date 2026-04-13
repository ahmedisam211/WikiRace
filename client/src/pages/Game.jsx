import { useState, useEffect, useRef, useCallback } from 'react'
import { PLAYER_COLORS } from './Lobby.jsx'

export default function Game({ room, myId, onNavigate, onGiveUp }) {
  const [articleTitle, setArticleTitle] = useState(room.startArticle)
  const [articleHtml, setArticleHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false)
  const contentRef = useRef(null)
  const timerRef = useRef(null)

  const myPlayer = room.players.find(p => p.id === myId)
  const iDone = !!(myPlayer?.finishedAt || myPlayer?.gaveUp)

  // Sync local article title with server state (e.g. when navigating)
  useEffect(() => {
    if (myPlayer?.currentArticle && myPlayer.currentArticle !== articleTitle) {
      setArticleTitle(myPlayer.currentArticle)
    }
  }, [myPlayer?.currentArticle])

  // Timer
  useEffect(() => {
    if (room.startedAt && !finished) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - room.startedAt) / 1000))
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [room.startedAt, finished])

  useEffect(() => {
    if (myPlayer?.finishedAt) { setFinished(true); clearInterval(timerRef.current) }
  }, [myPlayer?.finishedAt])

  // Extract article title from a Wikipedia href
  function titleFromHref(href) {
    if (!href) return null
    // Formats we see:
    //   ./Photosynthesis
    //   /wiki/Photosynthesis
    //   #section  (skip)
    //   https://...  (skip external)
    if (href.startsWith('#') || href.startsWith('http') || href.startsWith('//')) return null
    let path = href
    if (path.startsWith('./')) path = path.slice(2)
    if (path.startsWith('/wiki/')) path = path.slice(6)
    // Skip special namespaces
    const special = ['File:', 'Image:', 'Talk:', 'Wikipedia:', 'Help:', 'Category:', 'Special:', 'Template:', 'Portal:', 'User:', 'WP:']
    if (special.some(ns => path.startsWith(ns))) return null
    // Strip section anchor
    path = path.split('#')[0]
    if (!path) return null
    // Decode and normalise underscores → spaces
    try { return decodeURIComponent(path).replace(/_/g, ' ') } catch { return path.replace(/_/g, ' ') }
  }

  const fetchArticle = useCallback(async (title) => {
    setLoading(true)
    setFetchError(null)
    window.scrollTo({ top: 0 })
    try {
      const slug = encodeURIComponent(title.replace(/ /g, '_'))
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${slug}`)
      if (!res.ok) throw new Error(`Article not found (${res.status})`)
      const html = await res.text()

      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      // Remove clutter
      ;['.mw-references-wrap', '.reflist', 'style', 'script', '.mw-editsection',
        '.mw-empty-elt', '[role="navigation"]', '.sistersitebox', '.ambox',
        '.navbox', '.toc', 'sup.reference', '.mw-cite-backlink', '.hatnote'
      ].forEach(sel => doc.querySelectorAll(sel).forEach(el => el.remove()))

      // Get content section
      const content = doc.querySelector('[data-mw-section-id]') ||
                      doc.querySelector('.mw-parser-output') ||
                      doc.body

      // Process every <a>
      content.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href') || ''
        const wikiTitle = titleFromHref(href)
        if (wikiTitle) {
          a.setAttribute('data-wiki', wikiTitle)
          a.setAttribute('href', '#')
          a.className = 'wiki-link'
        } else {
          // Non-navigable — strip link
          const span = document.createElement('span')
          span.textContent = a.textContent
          a.replaceWith(span)
        }
      })

      // Fix images
      content.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src') || ''
        if (src.startsWith('//')) img.setAttribute('src', 'https:' + src)
        else if (src.startsWith('/')) img.setAttribute('src', 'https://en.wikipedia.org' + src)
      })

      // Fix base-relative sources (srcset etc.)
      content.querySelectorAll('[srcset]').forEach(el => {
        const srcset = el.getAttribute('srcset')
        el.setAttribute('srcset', srcset.replace(/\/\//g, 'https://').replace(/ \/wiki\//g, ' https://en.wikipedia.org/wiki/'))
      })

      setArticleHtml(content.innerHTML)
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchArticle(articleTitle) }, [articleTitle])

  // Delegate click handler on the container
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const handler = (e) => {
      const link = e.target.closest('[data-wiki]')
      if (!link) return
      e.preventDefault()
      if (iDone) return
      const title = link.getAttribute('data-wiki')
      if (!title) return
      setArticleTitle(title)
      onNavigate(title)
    }
    el.addEventListener('click', handler)
    return () => el.removeEventListener('click', handler)
  }, [iDone, onNavigate])

  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const sortedPlayers = [...room.players].sort((a, b) => {
    if (a.place && b.place) return a.place - b.place
    if (a.place && !a.gaveUp) return -1
    if (b.place && !b.gaveUp) return 1
    return b.clickCount - a.clickCount
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: 240, flexShrink: 0, background: 'var(--ink)', color: 'var(--paper)', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 10, borderRight: '2px solid var(--border)', overflowY: 'auto' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #333' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', letterSpacing: '0.05em' }}>WIKIRACE</div>
        </div>

        {/* Target */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #333' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#666', letterSpacing: '0.15em', marginBottom: '0.4rem' }}>TARGET</div>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--accent)', lineHeight: 1.3 }}>{room.endArticle}</div>
        </div>

        {/* My stats */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #333' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#666', letterSpacing: '0.15em', marginBottom: '0.6rem' }}>MY STATS</div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#666' }}>TIME</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '1.2rem' }}>{formatTime(elapsed)}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#666' }}>CLICKS</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '1.2rem' }}>{myPlayer?.clickCount || 0}</div>
            </div>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#666', marginBottom: '0.2rem' }}>CURRENT</div>
            <div style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.4, wordBreak: 'break-word' }}>{articleTitle}</div>
          </div>
        </div>

        {/* Players */}
        <div style={{ flex: 1, padding: '1rem 1.25rem' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#666', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>PLAYERS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sortedPlayers.map((player) => {
              const colorIdx = room.players.findIndex(p => p.id === player.id)
              return (
                <div key={player.id} style={{ padding: '0.5rem 0.6rem', background: player.id === myId ? '#1a1a1a' : 'transparent', borderRadius: 4, border: player.finishedAt && !player.gaveUp ? '1px solid var(--accent2)' : '1px solid transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: PLAYER_COLORS[colorIdx % PLAYER_COLORS.length], flexShrink: 0 }} />
                    <div style={{ fontSize: '12px', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {player.name}{player.id === myId && <span style={{ color: '#555', fontSize: '10px' }}> (you)</span>}
                    </div>
                    {player.place && !player.gaveUp && <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent2)', background: '#0f2b1a', borderRadius: 3, padding: '1px 4px' }}>#{player.place}</span>}
                    {player.gaveUp && <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#555' }}>out</span>}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: '#555', paddingLeft: '1rem' }}>
                    {player.finishedAt && !player.gaveUp ? '✓ finished' : `${player.clickCount} clicks`}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Give up / status */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #333' }}>
          {!iDone && (
            showGiveUpConfirm ? (
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#aaa', marginBottom: '0.5rem' }}>Are you sure?</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={onGiveUp} style={{ flex: 1, padding: '0.4rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 3, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '11px' }}>YES</button>
                  <button onClick={() => setShowGiveUpConfirm(false)} style={{ flex: 1, padding: '0.4rem', background: '#333', color: '#aaa', border: 'none', borderRadius: 3, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '11px' }}>NO</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowGiveUpConfirm(true)} style={{ width: '100%', padding: '0.5rem', background: 'none', border: '1px solid #333', color: '#555', borderRadius: 3, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.1em' }}>GIVE UP</button>
            )
          )}
          {myPlayer?.finishedAt && !myPlayer?.gaveUp && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent2)', textAlign: 'center' }}>✓ YOU FINISHED!</div>
          )}
          {myPlayer?.gaveUp && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#555', textAlign: 'center' }}>You gave up.</div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: 240, flex: 1, padding: '2rem', maxWidth: 860 }}>
        {/* Breadcrumb */}
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.8 }}>
          {(myPlayer?.path || []).slice(-5).map((p, i, arr) => (
            <span key={i}>
              <span style={{ color: i === arr.length - 1 ? 'var(--ink)' : 'var(--muted)', fontWeight: i === arr.length - 1 ? 600 : 400 }}>{p}</span>
              {i < arr.length - 1 && <span style={{ margin: '0 0.4rem', color: '#ccc' }}>→</span>}
            </span>
          ))}
        </div>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '3rem 0', color: 'var(--muted)' }}>
            <div style={{ width: 20, height: 20, border: '2px solid var(--paper2)', borderTopColor: 'var(--ink)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: '13px' }}>Loading {articleTitle}...</span>
          </div>
        )}

        {fetchError && !loading && (
          <div style={{ padding: '2rem 0', color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: '14px' }}>
            Failed to load article: {fetchError}
            <br />
            <button onClick={() => fetchArticle(articleTitle)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--ink)', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '12px' }}>Retry</button>
          </div>
        )}

        {!loading && !fetchError && (
          <div
            ref={contentRef}
            className="wiki-content animate-fadeup"
            style={{ opacity: iDone ? 0.5 : 1, pointerEvents: iDone ? 'none' : 'auto', cursor: iDone ? 'default' : 'auto' }}
            dangerouslySetInnerHTML={{ __html: articleHtml }}
          />
        )}
      </div>

      {/* Finished notification banner */}
      {myPlayer?.finishedAt && !myPlayer?.gaveUp && (
        <div style={{ position: 'fixed', top: 0, left: 240, right: 0, background: 'var(--accent2)', color: 'white', padding: '0.75rem', textAlign: 'center', fontFamily: 'var(--display)', fontSize: '1.2rem', letterSpacing: '0.1em', zIndex: 20 }}>
          YOU REACHED {room.endArticle.toUpperCase()}! — Waiting for others...
        </div>
      )}
    </div>
  )
}