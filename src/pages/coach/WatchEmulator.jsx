export default function WatchEmulator() {
  const src = import.meta.env.BASE_URL + 'watch-exports/emulator.html'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* header */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid #e5e7eb',
        background: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#111' }}>⌚ Watch Emulator</h1>
          <p style={{ fontSize: '.72rem', color: '#9ca3af', marginTop: 1 }}>
            Simulation séances · Garmin · Wahoo ELEMNT · Zwift
          </p>
        </div>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '.75rem', color: '#9ca3af', textDecoration: 'none' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#111' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af' }}
        >
          Plein écran ↗
        </a>
      </div>

      {/* emulator iframe */}
      <iframe
        src={src}
        title="Watch Emulator"
        style={{ flex: 1, border: 'none', width: '100%', minHeight: 0 }}
        allow="fullscreen"
      />
    </div>
  )
}
