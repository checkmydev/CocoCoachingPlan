import { generateRunTCX, generateBikeZWO, generateBikeMRC, downloadFile } from '../../lib/watchExports'

const BTN = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
  borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff',
  fontSize: '.78rem', fontWeight: 600, color: '#374151', cursor: 'pointer',
  textDecoration: 'none', whiteSpace: 'nowrap',
}

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
        flexWrap: 'wrap',
        gap: 8,
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

      {/* export bar */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid #e5e7eb',
        background: '#f9fafb',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: '.72rem', color: '#6b7280', fontWeight: 600, marginRight: 4 }}>
          Exporter la séance :
        </span>
        <button style={BTN} onClick={() => downloadFile(generateRunTCX('', 14), 'moovlab_8x100m_vma.tcx')}>
          ⬇ Garmin / Polar / Suunto <span style={{ fontSize: '.68rem', color: '#9ca3af', fontWeight: 400 }}>Course .tcx</span>
        </button>
        <button style={BTN} onClick={() => downloadFile(generateBikeZWO(''), 'moovlab_zone4_ftp.zwo')}>
          ⬇ Zwift <span style={{ fontSize: '.68rem', color: '#9ca3af', fontWeight: 400 }}>.zwo</span>
        </button>
        <button style={BTN} onClick={() => downloadFile(generateBikeMRC('', 200), 'moovlab_zone4_ftp.mrc')}>
          ⬇ Wahoo / TrainerRoad <span style={{ fontSize: '.68rem', color: '#9ca3af', fontWeight: 400 }}>.mrc</span>
        </button>
        <a
          href="https://connect.garmin.com/modern/import-data"
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...BTN, color: '#2563eb', borderColor: '#bfdbfe', background: '#eff6ff' }}
        >
          ↗ Importer sur Garmin Connect
        </a>
        <span style={{ fontSize: '.65rem', color: '#9ca3af', marginLeft: 4 }}>
          Valeurs personnalisées dans la fiche client → onglet Montre
        </span>
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
