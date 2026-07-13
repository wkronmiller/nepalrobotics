import siteData from '../data/site-data.json'
import PageHeader from '../components/PageHeader'
import ContentBlocks from '../components/ContentBlocks'
import './StaticPage.css'

export default function Advisers() {
  const blocks = siteData.pages['/advisers']?.blocks || []
  const heroImage = blocks.find((b) => b.type === 'image')?.localSrc

  return (
    <div>
      <PageHeader title="Advisers" subtitle="Distinguished advisors supporting the project" image={heroImage} />
      <section className="static-page container">
        <ContentBlocks blocks={blocks} />
      </section>
    </div>
  )
}