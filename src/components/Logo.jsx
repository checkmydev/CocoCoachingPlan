export default function Logo({ dark = false, size = 'md' }) {
  const heights = { sm: 32, md: 40, lg: 56 }
  const h = heights[size] ?? heights.md

  return (
    <img
      src={`${import.meta.env.BASE_URL}logo_movelab.png`}
      alt="MooV'Lab"
      style={{ height: h, width: 'auto', objectFit: 'contain' }}
    />
  )
}
