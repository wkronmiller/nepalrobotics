import { Link } from 'react-router-dom'
import './BlogCard.css'

export default function BlogCard({ post }) {
  const thumb = post.thumbnailLocal || post.thumbnail
  const excerpt = post.excerpt || post.blocks?.find((b) => b.type === 'text')?.content?.slice(0, 200)

  return (
    <article className="blog-card">
      {thumb && (
        <Link to={post.slug} className="blog-card-image">
          <img src={thumb} alt={post.title} loading="lazy" />
        </Link>
      )}
      <div className="blog-card-body">
        {post.date && <time className="blog-card-date">{post.date}</time>}
        <h2>
          <Link to={post.slug}>{post.title}</Link>
        </h2>
        {excerpt && <p className="blog-card-excerpt">{excerpt}…</p>}
        <Link to={post.slug} className="read-more">
          Read more →
        </Link>
      </div>
    </article>
  )
}