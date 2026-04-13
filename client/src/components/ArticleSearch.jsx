// import { useState, useRef, useEffect } from 'react'

// export default function ArticleSearch({ placeholder, onSelect, initial = '' }) {
//   const [query, setQuery] = useState(initial)
//   const [results, setResults] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [selected, setSelected] = useState(!!initial)
//   const [open, setOpen] = useState(false)
//   const debounceRef = useRef(null)
//   const wrapperRef = useRef(null)

//   useEffect(() => {
//     setQuery(initial || '')
//     setSelected(!!initial)
//   }, [initial])
//   useEffect(() => {
//     const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false) }
//     document.addEventListener('mousedown', handler)
//     return () => document.removeEventListener('mousedown', handler)
//   }, [])

//   const search = async (q) => {
//     if (!q.trim()) { setResults([]); return }
//     setLoading(true)
//     try {
//       const res = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=6&namespace=0&format=json&origin=*`)
//       const data = await res.json()
//       const titles = data[1] || []
//       setResults(titles)
//       setOpen(titles.length > 0)
//     } catch { setResults([]) }
//     finally { setLoading(false) }
//   }

//   const handleChange = (e) => {
//     const val = e.target.value
//     setQuery(val); setSelected(false); onSelect('')
//     clearTimeout(debounceRef.current)
//     debounceRef.current = setTimeout(() => search(val), 300)
//   }

//   const handleSelect = (title) => {
//     setQuery(title); setSelected(true); onSelect(title); setOpen(false); setResults([])
//   }

//   return (
//     <div ref={wrapperRef} style={{ position: 'relative' }}>
//       <div style={{ position: 'relative' }}>
//         <input value={query} onChange={handleChange} onFocus={() => results.length > 0 && setOpen(true)} placeholder={placeholder}
//           style={{ width: '100%', padding: '0.6rem 2.2rem 0.6rem 0.75rem', border: `1.5px solid ${selected ? 'var(--accent2)' : 'var(--paper2)'}`, borderRadius: 4, fontSize: '15px', fontFamily: 'var(--sans)', background: 'var(--paper)', color: 'var(--ink)', outline: 'none' }} />
//         {loading && <div style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, border: '2px solid var(--muted)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />}
//         {selected && !loading && <div style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent2)', fontSize: '16px', fontWeight: 700 }}>✓</div>}
//       </div>
//       {open && results.length > 0 && (
//         <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'white', border: '1.5px solid var(--border)', borderRadius: 4, boxShadow: '3px 3px 0 var(--border)', zIndex: 100, overflow: 'hidden' }}>
//           {results.map((title, i) => (
//             <div key={i} onMouseDown={() => handleSelect(title)}
//               style={{ padding: '0.6rem 0.85rem', cursor: 'pointer', fontSize: '14px', fontFamily: 'var(--sans)', borderBottom: i < results.length - 1 ? '1px solid var(--paper2)' : 'none' }}
//               onMouseEnter={e => e.currentTarget.style.background = 'var(--paper)'}
//               onMouseLeave={e => e.currentTarget.style.background = 'white'}>
//               <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', marginRight: '0.5rem' }}>WP</span>
//               {title}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }


import { useState, useRef, useEffect } from 'react'

export default function ArticleSearch({ placeholder, onSelect, initial = '' }) {
  const [query, setQuery] = useState(initial)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(!!initial)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    setQuery(initial || '')
    setSelected(!!initial)
  }, [initial])
  
  useEffect(() => {
    const handler = (e) => { 
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false) 
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  const search = async (q) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=6&namespace=0&format=json&origin=*`)
      const data = await res.json()
      const titles = data[1] || []
      setResults(titles)
      setOpen(titles.length > 0)
    } catch { setResults([]) }
    finally { setLoading(false) }
  }

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val); setSelected(false); onSelect('')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const handleSelect = (title) => {
    setQuery(title); setSelected(true); onSelect(title); setOpen(false); setResults([])
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input 
          value={query} 
          onChange={handleChange} 
          onFocus={() => results.length > 0 && setOpen(true)} 
          placeholder={placeholder}
          style={{ 
            width: '100%', 
            padding: 'clamp(0.5rem, 1vw, 0.6rem) clamp(1.8rem, 3vw, 2.2rem) clamp(0.5rem, 1vw, 0.6rem) clamp(0.5rem, 1vw, 0.75rem)', 
            border: `1.5px solid ${selected ? 'var(--accent2)' : 'var(--paper2)'}`, 
            borderRadius: 4, 
            fontSize: 'clamp(13px, 2vw, 15px)', 
            fontFamily: 'var(--sans)', 
            background: 'var(--paper)', 
            color: 'var(--ink)', 
            outline: 'none',
            transition: 'border-color 0.2s'
          }} 
        />
        {loading && (
          <div style={{ 
            position: 'absolute', 
            right: 'clamp(0.4rem, 1vw, 0.6rem)', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            width: 14, 
            height: 14, 
            border: '2px solid var(--muted)', 
            borderTopColor: 'transparent', 
            borderRadius: '50%', 
            animation: 'spin 0.7s linear infinite' 
          }} />
        )}
        {selected && !loading && (
          <div style={{ 
            position: 'absolute', 
            right: 'clamp(0.4rem, 1vw, 0.6rem)', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--accent2)', 
            fontSize: '16px', 
            fontWeight: 700 
          }}>✓</div>
        )}
      </div>
      {open && results.length > 0 && (
        <div style={{ 
          position: 'absolute', 
          top: 'calc(100% + 4px)', 
          left: 0, 
          right: 0, 
          background: 'white', 
          border: '1.5px solid var(--border)', 
          borderRadius: 4, 
          boxShadow: '3px 3px 0 var(--border)', 
          zIndex: 100, 
          overflow: 'hidden',
          maxHeight: 'clamp(150px, 50vh, 300px)',
          overflowY: 'auto'
        }}>
          {results.map((title, i) => (
            <div 
              key={i} 
              onMouseDown={() => handleSelect(title)}
              onTouchEnd={() => handleSelect(title)}
              style={{ 
                padding: 'clamp(0.4rem, 1vw, 0.6rem) clamp(0.6rem, 1vw, 0.85rem)', 
                cursor: 'pointer', 
                fontSize: 'clamp(13px, 1.8vw, 14px)', 
                fontFamily: 'var(--sans)', 
                borderBottom: i < results.length - 1 ? '1px solid var(--paper2)' : 'none',
                transition: 'background 0.15s',
                userSelect: 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--paper)'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
              onTouchStart={e => e.currentTarget.style.background = 'var(--paper)'}
            >
              <span style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(9px, 1.5vw, 10px)', color: 'var(--muted)', marginRight: '0.5rem' }}>WP</span>
              {title}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
