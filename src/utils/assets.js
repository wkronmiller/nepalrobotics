export function assetUrl(src) {
  if (!src || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(src)) return src

  const base = import.meta.env.BASE_URL || '/'
  return `${base}${src.replace(/^\/+/, '')}`
}

const RESPONSIVE_IMAGE_PATH = /^\/images\/(?:gallery|thumbnails)\//i
const DEFAULT_RESPONSIVE_WIDTHS = [320, 640]

export function responsiveImageSrcSet(src, widths = DEFAULT_RESPONSIVE_WIDTHS) {
  if (!src || !RESPONSIVE_IMAGE_PATH.test(src) || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(src)) {
    return null
  }

  const extension = src.match(/\.[^.?#/]+(?:[?#].*)?$/)?.[0]
  if (!extension || !/\.(?:jpe?g|png)$/i.test(extension.split(/[?#]/)[0])) return null

  const base = src.slice(0, -extension.length)
  const cleanWidths = [...new Set(widths)].filter((width) => Number.isFinite(width) && width > 0)
  if (!cleanWidths.length) return null

  return cleanWidths
    .sort((a, b) => a - b)
    .map((width) => `${assetUrl(`${base}-${width}.webp`)} ${width}w`)
    .join(', ')
}

export function imageAlt(src, fallback = 'Nepal Robotics project photo') {
  if (!src) return fallback

  const rawFilename = src.split('/').pop()?.split('?')[0] || ''
  let filename
  try {
    filename = decodeURIComponent(rawFilename)
  } catch {
    filename = rawFilename
  }
  filename = filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!filename) return fallback
  return filename.charAt(0).toUpperCase() + filename.slice(1)
}
