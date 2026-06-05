import { describe, it, expect } from 'vitest'
import { detectVideoType, getYouTubeEmbedUrl, getVimeoEmbedUrl } from './videoUtils'

describe('detectVideoType', () => {
  it('detects YouTube watch URL', () => {
    expect(detectVideoType('https://www.youtube.com/watch?v=abc123')).toBe('youtube')
  })
  it('detects YouTube short URL', () => {
    expect(detectVideoType('https://youtu.be/abc123')).toBe('youtube')
  })
  it('detects Vimeo URL', () => {
    expect(detectVideoType('https://vimeo.com/123456789')).toBe('vimeo')
  })
  it('returns upload for storage URLs', () => {
    expect(detectVideoType('https://storage.example.com/video.mp4')).toBe('upload')
  })
  it('returns null for empty string', () => {
    expect(detectVideoType('')).toBe(null)
  })
  it('returns null for null', () => {
    expect(detectVideoType(null)).toBe(null)
  })
})

describe('getYouTubeEmbedUrl', () => {
  it('extracts ID from watch URL', () => {
    expect(getYouTubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'))
      .toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
  })
  it('extracts ID from short URL', () => {
    expect(getYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ'))
      .toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
  })
  it('returns null for non-YouTube URL', () => {
    expect(getYouTubeEmbedUrl('https://vimeo.com/123')).toBe(null)
  })
})

describe('getVimeoEmbedUrl', () => {
  it('extracts ID from Vimeo URL', () => {
    expect(getVimeoEmbedUrl('https://vimeo.com/123456789'))
      .toBe('https://player.vimeo.com/video/123456789')
  })
  it('returns null for non-Vimeo URL', () => {
    expect(getVimeoEmbedUrl('https://youtube.com/watch?v=abc')).toBe(null)
  })
})
