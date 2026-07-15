import siteData from '../data/site-data.json'
import PageTitle from '../components/PageTitle'
import './StaticPage.css'
import './RelatedLinks.css'

function linkLabel(url) {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    const path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '')
    if (!path || path.length > 40) return host
    return `${host}${path}`
  } catch {
    return url
  }
}

function normalizeLink(entry) {
  if (typeof entry === 'string') return { url: entry, description: '' }
  return {
    url: entry.url,
    description: entry.description || '',
  }
}

export default function RelatedLinks() {
  const links = (siteData.external_links || []).map(normalizeLink)

  return (
    <section className="static-page container">
      <PageTitle title="Related Links" />
      <p className="prose links-intro">
        Websites related to the Nepal Robotics Project, including partners, research, rescue
        organizations, and drone resources.
      </p>
      {links.length > 0 ? (
        <ul className="links-list">
          {links.map((link, i) => (
            <li key={link.url || i}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <span className="link-label">{linkLabel(link.url)}</span>
                {link.description ? (
                  <span className="link-description">{link.description}</span>
                ) : null}
                <span className="link-url">{link.url}</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="prose">No related links available.</p>
      )}
    </section>
  )
}
