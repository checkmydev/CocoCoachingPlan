export default function Logo({ dark = false, size = 'md' }) {
  const sizes = {
    sm: { text: 'text-base', svg: 22 },
    md: { text: 'text-xl',  svg: 28 },
    lg: { text: 'text-3xl', svg: 40 },
  }
  const { text, svg } = sizes[size] ?? sizes.md
  const green = '#39E229'
  const textColor = dark ? '#ffffff' : '#111111'

  return (
    <div className={`flex items-center gap-2 select-none`}>
      {/* ECG / heartbeat icon */}
      <svg width={svg} height={svg} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" stroke={green} strokeWidth="2.5"/>
        <polyline
          points="5,20 10,20 13,10 17,30 20,14 23,26 26,20 35,20"
          stroke={green}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark */}
      <span className={`font-black tracking-tight leading-none ${text}`} style={{ color: textColor }}>
        Moo<span style={{ color: green }}>V</span>
        <span className="font-light" style={{ color: green }}>'</span>
        <span style={{ color: textColor }}>Lab</span>
      </span>
    </div>
  )
}
