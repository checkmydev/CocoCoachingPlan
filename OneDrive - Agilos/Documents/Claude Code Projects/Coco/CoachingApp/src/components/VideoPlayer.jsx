import { detectVideoType, getYouTubeEmbedUrl, getVimeoEmbedUrl } from '../lib/videoUtils'

export default function VideoPlayer({ url, className = '' }) {
  const type = detectVideoType(url)
  if (!type) return null

  if (type === 'youtube') {
    return (
      <div className={`aspect-video ${className}`}>
        <iframe src={getYouTubeEmbedUrl(url)} className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen />
      </div>
    )
  }
  if (type === 'vimeo') {
    return (
      <div className={`aspect-video ${className}`}>
        <iframe src={getVimeoEmbedUrl(url)} className="w-full h-full rounded-lg"
          allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      </div>
    )
  }
  return <video src={url} controls className={`w-full rounded-lg ${className}`} />
}
