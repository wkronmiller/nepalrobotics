import siteData from '../data/site-data.json'
import PageHeader from '../components/PageHeader'
import ContentBlocks from '../components/ContentBlocks'
import './StaticPage.css'
import './RelatedLinks.css'

export default function RelatedLinks() {
  const blocks = siteData.pages['/related-links']?.blocks || []
  const links = siteData.external_links || []
  const heroImage = blocks.find((b) => b.type === 'image')?.localSrc

  return (
    <div>
      <PageHeader title="Related Links" subtitle="Websites related to our project" image={heroImage} />
      <section className="static-page container">
        <ContentBlocks blocks={blocks.filter((b) => b.type !== 'image')} />
        {links.length > 0 && (
          <ul className="links-list">
            {links.map((url, i) => (
              <li key={i}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}