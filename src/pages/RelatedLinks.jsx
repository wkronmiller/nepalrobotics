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

export default function RelatedLinks() {
  const links = siteData.external_links || []

  return (
    <section className="static-page container">
      <PageTitle title="Related Links" />
      {links.length > 0 ? (
        <ul className="links-list">
          {links.map((url, i) => (
            <li key={i}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <span className="link-label">{linkLabel(url)}</span>
                <span className="link-url">{url}</span>
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
