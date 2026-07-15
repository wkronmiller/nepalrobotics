import fs from 'fs'

const data = JSON.parse(fs.readFileSync('src/data/site-data.json', 'utf8'))
const links = (data.external_links || [])
  .map((entry) => (typeof entry === 'string' ? entry : entry.url))
  .filter(Boolean)

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function extractMeta(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  const ogTitle = html.match(/property=["']og:title["'][^>]*content=["']([^"']*)["']/i)
    || html.match(/content=["']([^"']*)["'][^>]*property=["']og:title["']/i)
  const ogDesc = html.match(/property=["']og:description["'][^>]*content=["']([^"']*)["']/i)
    || html.match(/content=["']([^"']*)["'][^>]*property=["']og:description["']/i)
  const metaDesc = html.match(/name=["']description["'][^>]*content=["']([^"']*)["']/i)
    || html.match(/content=["']([^"']*)["'][^>]*name=["']description["']/i)

  const title = decodeHtmlEntities((ogTitle?.[1] || titleMatch?.[1] || '').trim())
  const description = decodeHtmlEntities((ogDesc?.[1] || metaDesc?.[1] || '').trim())
  return { title, description }
}

async function fetchMeta(url) {
  const cleanUrl = decodeHtmlEntities(url)
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)
    const res = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NepalRoboticsBot/1.0)' },
      redirect: 'follow',
    })
    clearTimeout(timeout)
    if (!res.ok) return { url: cleanUrl, error: `HTTP ${res.status}` }
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return { url: cleanUrl, title: cleanUrl.split('/').pop(), description: 'Document or resource file.' }
    }
    const html = await res.text()
    const { title, description } = extractMeta(html)
    return { url: cleanUrl, title, description }
  } catch (err) {
    return { url: cleanUrl, error: err.message }
  }
}

const batchSize = 8
const results = []
for (let i = 0; i < links.length; i += batchSize) {
  const batch = links.slice(i, i + batchSize)
  const batchResults = await Promise.all(batch.map(fetchMeta))
  results.push(...batchResults)
  console.error(`Fetched ${Math.min(i + batchSize, links.length)}/${links.length}`)
}

console.log(JSON.stringify(results, null, 2))