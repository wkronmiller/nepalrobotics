import siteData from '../data/site-data.json'
import PageHeader from '../components/PageHeader'
import ContentBlocks from '../components/ContentBlocks'
import './StaticPage.css'

export default function Donors() {
  const blocks = siteData.pages['/donors']?.blocks || []
  const heroImage = blocks.find((b) => b.type === 'image')?.localSrc

  return (
    <div>
      <PageHeader title="Donors" subtitle="Thank you to our generous supporters" image={heroImage} />
      <section className="static-page container">
        <ContentBlocks blocks={blocks} />
      </section>
    </div>
  )
}