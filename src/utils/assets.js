export function assetUrl(src) {
  if (!src || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(src)) return src

  const base = import.meta.env.BASE_URL || '/'
  return `${base}${src.replace(/^\/+/, '')}`
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
