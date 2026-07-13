import siteData from '../data/site-data.json'
import PageTitle from '../components/PageTitle'
import BlogCard from '../components/BlogCard'
import './Updates.css'

export default function UsaUpdates() {
  const posts = siteData.posts?.filter((p) => p.collection === 'usa') || []

  return (
    <section className="updates-page container">
      <PageTitle title="USA Updates" />
      <div className="blog-grid">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
      </div>
    </section>
  )
}