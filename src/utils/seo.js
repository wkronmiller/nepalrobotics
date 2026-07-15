export const DEFAULT_SITE_URL = 'https://nepalrobotics.org'

const HERO_IMAGE = '/images/gallery/mck_nepal_2017_rev._1_everest_summit_best_DSC_7297.jpg'
const LOGO_IMAGE = '/images/logos/logo.png'

export const PATH_ALIASES = {
  '/home': '/',
  '/advisers': '/collaborators/advisers',
  '/students': '/collaborators/advisers',
  '/students-1': '/collaborators/students',
  '/donors': '/collaborators/donors',
  '/collaborators': '/collaborators/advisers',
  '/collaborators/advisors': '/collaborators/advisers',
}

export function getSiteUrl(configuredUrl = DEFAULT_SITE_URL) {
  return (configuredUrl || DEFAULT_SITE_URL).replace(/\/+$/, '')
}

export function getBasePath(baseUrl = '/') {
  const basePath = (baseUrl || '/').replace(/\/+$/, '')
  return basePath === '/' ? '' : basePath
}

export function normalizePath(pathname, baseUrl = '/') {
  const basePath = getBasePath(baseUrl)
  let path = pathname || '/'

  if (basePath && (path === basePath || path.startsWith(`${basePath}/`))) {
    path = path.slice(basePath.length) || '/'
  }

  return `/${path.replace(/^\/+|\/+$/g, '')}`.replace('//', '/') || '/'
}

export function absolutePageUrl(siteUrl, pathname, baseUrl = '/') {
  const basePath = getBasePath(baseUrl)
  const path = pathname === '/' ? '/' : pathname
  return `${getSiteUrl(siteUrl)}${basePath}${path}`
}

export function absoluteAssetUrl(siteUrl, src, baseUrl = '/') {
  if (!src) return undefined
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(src)) return src
  const basePath = getBasePath(baseUrl)
  return `${getSiteUrl(siteUrl)}${basePath}/${src.replace(/^\/+/, '')}`
}

function cleanText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncateText(value, maxLength = 160) {
  const text = cleanText(value)
  if (text.length <= maxLength) return text

  const candidate = text.slice(0, maxLength - 1).trimEnd()
  const boundary = candidate.lastIndexOf(' ')
  const truncated = boundary >= Math.floor(maxLength * 0.6)
    ? candidate.slice(0, boundary)
    : candidate
  return `${truncated}…`
}

export function getPostDate(post) {
  const explicitDate = getIsoDate(post?.date)
  if (explicitDate) return explicitDate

  const match = post?.slug?.match(/\/(\d{4})\/(\d{1,2})\/(\d{1,2})\//)
  if (!match) return undefined
  return getIsoDate(`${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`)
}

export function getIsoDate(value) {
  if (!value) return undefined
  const text = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text

  const match = text.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/)
  if (!match) return undefined

  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ]
  const month = months.indexOf(match[1].toLowerCase())
  const day = Number(match[2])
  const year = Number(match[3])
  const date = new Date(Date.UTC(year, month, day))
  if (
    month < 0 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day
  ) {
    return undefined
  }

  return date.toISOString().slice(0, 10)
}

function getHomeDescription(siteData) {
  const blocks = siteData?.pages?.['/']?.blocks || []
  const intro = blocks
    .filter((block) => block.type === 'html' || block.type === 'text')
    .sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0))[0]

  return truncateText(intro?.content || siteData?.meta?.tagline)
}

function getPostDescription(post, fallback) {
  const textBlock = post?.blocks?.find((block) => block.type === 'text')
  if (textBlock?.content || post?.excerpt) {
    return truncateText(textBlock?.content || post?.excerpt || fallback)
  }
  if (post?.blocks?.some((block) => block.type === 'video')) {
    return truncateText('Video update — watch the full recording.')
  }
  return truncateText(fallback)
}

function getPostImage(post) {
  if (post?.thumbnailLocal || post?.thumbnail) {
    return post.thumbnailLocal || post.thumbnail
  }

  const imageBlock = post?.blocks?.find((block) => block.type === 'image')
  if (imageBlock?.localSrc || imageBlock?.src) {
    return imageBlock.localSrc || imageBlock.src
  }

  const videoBlock = post?.blocks?.find((block) => block.type === 'video' && block.youtubeId)
  if (videoBlock) {
    return `https://img.youtube.com/vi/${videoBlock.youtubeId}/hqdefault.jpg`
  }

  return null
}

export function getSeoForPath(pathname, siteData, siteUrl = DEFAULT_SITE_URL, baseUrl = '/') {
  const meta = siteData?.meta || {}
  const siteName = meta.title || 'Nepal Robotics Project'
  const tagline = meta.tagline || 'An International Collaborative Robotics Project'
  const normalizedPath = normalizePath(pathname, baseUrl)
  const canonicalPath = PATH_ALIASES[normalizedPath] || normalizedPath
  const defaultDescription = `${siteName} — ${tagline}.`
  const page = {
    title: siteName,
    description: getHomeDescription(siteData) || defaultDescription,
    type: 'website',
    robots: 'index, follow',
    image: absoluteAssetUrl(siteUrl, HERO_IMAGE, baseUrl),
    imageAlt: `${siteName} team near Mount Everest`,
  }

  const pageMeta = {
    '/usa-updates': {
      title: `USA Updates | ${siteName}`,
      description: 'Updates from the United States team building and testing robotics for humanitarian work in Nepal.',
    },
    '/nepal-updates': {
      title: `Nepal Updates | ${siteName}`,
      description: 'Updates from students and collaborators in Nepal using robotics and STEM education to support their communities.',
    },
    '/collaborators/advisers': {
      title: `Advisers | ${siteName}`,
      description: `Meet the advisers supporting the ${siteName} international robotics and STEM collaboration.`,
    },
    '/collaborators/students': {
      title: `Students | ${siteName}`,
      description: `Meet the students participating in the ${siteName} robotics and STEM collaboration in the USA and Nepal.`,
    },
    '/collaborators/donors': {
      title: `Donors | ${siteName}`,
      description: `Learn about the donors supporting the ${siteName} international robotics project.`,
    },
    '/related-links': {
      title: `Related Links | ${siteName}`,
      description: `Resources and partner links related to the ${siteName} robotics, drones, and STEM education project.`,
    },
    '/related-videos': {
      title: `Related Videos | ${siteName}`,
      description: `Videos about the ${siteName} robotics project, drone research, and STEM collaboration.`,
    },
  }

  if (pageMeta[normalizedPath] || pageMeta[canonicalPath]) {
    Object.assign(page, pageMeta[normalizedPath] || pageMeta[canonicalPath])
  }

  const post = siteData?.posts?.find((candidate) => candidate.slug === normalizedPath)
  if (post) {
    const title = post.title?.trim() || 'Project update'
    const postImage = getPostImage(post)
    Object.assign(page, {
      title: `${title} | ${siteName}`,
      description: getPostDescription(post, `${title} — ${tagline}.`),
      type: 'article',
      image: absoluteAssetUrl(siteUrl, postImage, baseUrl) || page.image,
      imageAlt: postImage ? title : page.imageAlt,
      datePublished: getPostDate(post),
    })
  }

  const isLegacyRedirect = Object.hasOwn(PATH_ALIASES, normalizedPath)
  const isNotFound = !post && normalizedPath !== '/' && !pageMeta[normalizedPath] && !isLegacyRedirect
  if (isNotFound) {
    Object.assign(page, {
      title: `Page not found | ${siteName}`,
      description: 'The requested Nepal Robotics Project page could not be found.',
      robots: 'noindex, follow',
    })
  } else if (isLegacyRedirect) {
    page.robots = 'noindex, follow'
  }

  return {
    ...page,
    url: absolutePageUrl(siteUrl, isNotFound ? '/' : canonicalPath, baseUrl),
    siteName,
    siteUrl: getSiteUrl(siteUrl),
    baseUrl,
    tagline,
  }
}

export function getStructuredData(seo, siteData) {
  const sameAs = []
  if (siteData?.meta?.twitter) {
    sameAs.push(`https://twitter.com/${siteData.meta.twitter.replace(/^@/, '')}`)
  }
  if (siteData?.meta?.youtube) sameAs.push(siteData.meta.youtube)

  const organization = {
    '@type': 'Organization',
    '@id': `${seo.siteUrl}/#organization`,
    name: seo.siteName,
    url: seo.siteUrl,
    logo: absoluteAssetUrl(seo.siteUrl, LOGO_IMAGE, seo.baseUrl),
    ...(sameAs.length ? { sameAs } : {}),
  }
  const websiteUrl = absolutePageUrl(seo.siteUrl, '/', seo.baseUrl)
  const website = {
    '@type': 'WebSite',
    '@id': `${websiteUrl}#website`,
    url: websiteUrl,
    name: seo.siteName,
    publisher: { '@id': organization['@id'] },
    inLanguage: 'en-US',
  }
  const page = seo.type === 'article'
    ? {
        '@type': 'Article',
        '@id': `${seo.url}#article`,
        headline: seo.title.replace(` | ${seo.siteName}`, ''),
        description: seo.description,
        mainEntityOfPage: { '@type': 'WebPage', '@id': seo.url },
        image: seo.image ? [seo.image] : undefined,
        ...(seo.datePublished ? { datePublished: seo.datePublished } : {}),
        author: { '@id': organization['@id'] },
        publisher: { '@id': organization['@id'] },
      }
    : {
        '@type': 'WebPage',
        '@id': `${seo.url}#webpage`,
        url: seo.url,
        name: seo.title,
        description: seo.description,
        isPartOf: { '@id': website['@id'] },
        inLanguage: 'en-US',
        ...(seo.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: seo.image } } : {}),
      }

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, website, page],
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function renderSeoTags(seo, siteData) {
  const structuredData = JSON.stringify(getStructuredData(seo, siteData)).replace(/</g, '\\u003c')
  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="robots" content="${escapeHtml(seo.robots)}" />`,
    `<link rel="canonical" href="${escapeHtml(seo.url)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(seo.siteName)}" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:type" content="${seo.type === 'article' ? 'article' : 'website'}" />`,
    `<meta property="og:url" content="${escapeHtml(seo.url)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:image" content="${escapeHtml(seo.image)}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(seo.imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="@nepalrobotics" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(seo.image)}" />`,
    `<script type="application/ld+json">${structuredData}</script>`,
  ]
  return tags.map((tag) => `    ${tag}`).join('\n')
}
