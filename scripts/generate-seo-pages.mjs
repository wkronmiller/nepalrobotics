import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import {
  absolutePageUrl,
  getBasePath,
  getSeoForPath,
  getSiteUrl,
  PATH_ALIASES,
  renderSeoTags,
} from '../src/utils/seo.js'

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const distDir = path.join(rootDir, 'dist')
const data = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/site-data.json'), 'utf8'))
const templatePath = path.join(distDir, 'index.html')
const template = fs.readFileSync(templatePath, 'utf8')
const env = loadEnv('production', rootDir, '')
const siteUrl = getSiteUrl(process.env.VITE_SITE_URL || env.VITE_SITE_URL)
const baseUrl = process.env.VITE_BASE_PATH || env.VITE_BASE_PATH || '/'
const basePath = getBasePath(baseUrl)

const staticRoutes = [
  '/',
  '/usa-updates',
  '/nepal-updates',
  '/collaborators/advisers',
  '/collaborators/students',
  '/collaborators/donors',
  '/related-links',
  '/related-videos',
  // Generate metadata for client-side aliases so direct visits do not look indexable.
  ...Object.keys(PATH_ALIASES),
  ...(data.posts || []).map((post) => post.slug),
]

const heroPreloadPattern = /\n    <!-- home-hero-preload:start -->[\s\S]*?    <!-- home-hero-preload:end -->/

function renderPage(route) {
  const seo = getSeoForPath(route, data, siteUrl, baseUrl)
  const seoTags = renderSeoTags(seo, data)
  const pageTemplate = route === '/' ? template : template.replace(heroPreloadPattern, '')
  return pageTemplate.replace(
    /    <!-- SEO:start -->[\s\S]*?    <!-- SEO:end -->/,
    `    <!-- SEO:start -->\n${seoTags}\n    <!-- SEO:end -->`,
  )
}

for (const route of [...new Set(staticRoutes)]) {
  const outputPath = route === '/'
    ? templatePath
    : path.join(distDir, route.replace(/^\/+|\/+$/g, ''), 'index.html')
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, renderPage(route))
}

const notFoundSeo = {
  ...getSeoForPath('/__not-found__', data, siteUrl, baseUrl),
  title: `Page not found | ${data.meta?.title || 'Nepal Robotics Project'}`,
  description: 'The requested Nepal Robotics Project page could not be found.',
  url: absolutePageUrl(siteUrl, '/', baseUrl),
  robots: 'noindex, follow',
}
fs.writeFileSync(
  path.join(distDir, '404.html'),
  template
    .replace(heroPreloadPattern, '')
    .replace(
      /    <!-- SEO:start -->[\s\S]*?    <!-- SEO:end -->/,
      `    <!-- SEO:start -->\n${renderSeoTags(notFoundSeo, data)}\n    <!-- SEO:end -->`,
    ),
)

function xmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const sitemapUrls = [...new Set(staticRoutes)]
  .map((route) => getSeoForPath(route, data, siteUrl, baseUrl))
  .filter((seo) => seo.robots === 'index, follow')
  .map((seo) => `  <url><loc>${xmlEscape(seo.url)}</loc></url>`)
  .join('\n')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap)

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}${basePath}/sitemap.xml\n`
fs.writeFileSync(path.join(distDir, 'robots.txt'), robots)
