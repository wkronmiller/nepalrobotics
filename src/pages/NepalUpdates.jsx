import siteData from '../data/site-data.json'
import PageHeader from '../components/PageHeader'
import BlogCard from '../components/BlogCard'
import './Updates.css'

export default function NepalUpdates() {
  const posts = siteData.posts?.filter((p) => p.collection === 'nepal') || []

  return (
    <div>
      <PageHeader title="Nepal Updates" subtitle="Project updates from the Nepal team at Kanjirowa School" />
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