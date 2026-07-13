import siteData from '../data/site-data.json'
import PageTitle from '../components/PageTitle'
import CollaboratorNav from '../components/CollaboratorNav'
import ContentBlocks from '../components/ContentBlocks'
import './StaticPage.css'

export default function Donors() {
  const blocks = siteData.pages['/donors']?.blocks || []
  const textBlocks = blocks.filter((b) => b.type === 'html' || b.type === 'text')

  return (
    <div>
      <div className="container">
        <PageTitle title="Donors" />
      </div>
      <CollaboratorNav />
      <section className="static-page container">
        <ContentBlocks blocks={textBlocks} />
      </section>
    </div>
  )
}
