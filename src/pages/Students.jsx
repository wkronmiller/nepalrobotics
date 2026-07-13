import siteData from '../data/site-data.json'
import PageHeader from '../components/PageHeader'
import ContentBlocks from '../components/ContentBlocks'
import './StaticPage.css'

export default function Students() {
  const blocks = siteData.pages['/students-1']?.blocks || []
  const heroImage = blocks.find((b) => b.type === 'image')?.localSrc

  return (
    <div>
      <PageHeader title="Students" subtitle="Student participants from Bullis School and Kanjirowa School" image={heroImage} />
      <section className="static-page container">
        <ContentBlocks blocks={blocks} />
      </section>
    </div>
  )
}