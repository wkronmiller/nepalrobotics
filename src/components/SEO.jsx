import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import siteData from '../data/site-data.json'
import {
  getSeoForPath,
  getSiteUrl,
  getStructuredData,
} from '../utils/seo'

const MANAGED_META = [
  ['name', 'description'],
  ['name', 'robots'],
  ['name', 'twitter:card'],
  ['name', 'twitter:site'],
  ['name', 'twitter:title'],
  ['name', 'twitter:description'],
  ['name', 'twitter:image'],
  ['property', 'og:site_name'],
  ['property', 'og:title'],
  ['property', 'og:description'],
  ['property', 'og:type'],
  ['property', 'og:url'],
  ['property', 'og:locale'],
  ['property', 'og:image'],
  ['property', 'og:image:alt'],
]

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function upsertCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  element.setAttribute('href', url)
}

export default function SEO() {
  const location = useLocation()

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/'
    const seo = getSeoForPath(
      location.pathname,
      siteData,
      getSiteUrl(import.meta.env.VITE_SITE_URL),
      baseUrl,
    )

    document.title = seo.title
    upsertCanonical(seo.url)
    const metaValues = {
      'name:description': seo.description,
      'name:robots': seo.robots,
      'name:twitter:card': 'summary_large_image',
      'name:twitter:site': '@nepalrobotics',
      'name:twitter:title': seo.title,
      'name:twitter:description': seo.description,
      'name:twitter:image': seo.image,
      'property:og:site_name': seo.siteName,
      'property:og:title': seo.title,
      'property:og:description': seo.description,
      'property:og:type': seo.type === 'article' ? 'article' : 'website',
      'property:og:url': seo.url,
      'property:og:locale': 'en_US',
      'property:og:image': seo.image,
      'property:og:image:alt': seo.imageAlt,
    }
    for (const [attribute, key] of MANAGED_META) {
      upsertMeta(attribute, key, metaValues[`${attribute}:${key}`])
    }

    let structuredData = document.head.querySelector(
      'script[data-seo-jsonld], script[type="application/ld+json"]',
    )
    if (!structuredData) {
      structuredData = document.createElement('script')
      structuredData.type = 'application/ld+json'
      structuredData.dataset.seoJsonld = 'true'
      document.head.appendChild(structuredData)
    }
    structuredData.textContent = JSON.stringify(getStructuredData(seo, siteData))
  }, [location.pathname])

  return null
}
