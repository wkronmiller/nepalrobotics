import siteData from '../data/site-data.json'
import PageHeader from '../components/PageHeader'
import BlogCard from '../components/BlogCard'
import './Updates.css'

export default function UsaUpdates() {
  const posts = siteData.posts?.filter((p) => p.collection === 'usa') || []

  return (
    <div>
      <PageHeader title="USA Updates" subtitle="Project updates from the United States team" />
      <section className="updates-page container">
        <div className="blog-grid">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}