import siteData from '../data/site-data.json'
import PageTitle from '../components/PageTitle'
import CollaboratorNav from '../components/CollaboratorNav'
import ContentBlocks from '../components/ContentBlocks'
import './StaticPage.css'

export default function Advisers() {
  const blocks = siteData.pages['/advisers']?.blocks || []
  const textBlocks = blocks.filter((b) => b.type === 'html' || b.type === 'text')

  return (
    <div>
      <div className="container">
        <PageTitle title="Advisers" />
      </div>
      <CollaboratorNav />
      <section className="static-page container">
        <ContentBlocks blocks={textBlocks} />
      </section>
    </div>
  )
}
