import siteData from '../data/site-data.json'
import PageHeader from '../components/PageHeader'
import ContentBlocks from '../components/ContentBlocks'
import './StaticPage.css'

export default function Collaborators() {
  const blocks = siteData.pages['/students']?.blocks || []
  const heroImage = blocks.find((b) => b.type === 'image')?.localSrc

  return (
    <div>
      <PageHeader title="Collaborators" subtitle="Partners and collaborators on the Nepal Robotics Project" image={heroImage} />
      <section className="static-page container">
        <ContentBlocks blocks={blocks} />
      </section>
    </div>
  )
}