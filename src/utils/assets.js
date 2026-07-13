export function assetUrl(src) {
  if (!src || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(src)) return src

  const base = import.meta.env.BASE_URL || '/'
  return `${base}${src.replace(/^\/+/, '')}`
}
