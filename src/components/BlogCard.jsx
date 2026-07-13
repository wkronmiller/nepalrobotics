import { Link } from 'react-router-dom'
import { assetUrl } from '../utils/assets'
import './BlogCard.css'

export default function BlogCard({ post }) {
  const title = post.title?.trim() || 'Project update'
  const thumb = assetUrl(post.thumbnailLocal || post.thumbnail)
  const sourceText = post.blocks?.find((block) => block.type === 'text')?.content || post.excerpt || ''
  const normalizedText = sourceText.replace(/\s+/g, ' ').trim()
  const excerpt = normalizedText.length > 200
    ? `${normalizedText.slice(0, 200).trimEnd()}…`
    : normalizedText

  return (
    <article className="blog-card">
      {thumb && (
        <Link to={post.slug} className="blog-card-image">
          <img src={thumb} alt={title} loading="lazy" />
        </Link>
      )}
      <div className="blog-card-body">
        {post.date && <time className="blog-card-date">{post.date}</time>}
        <h2>
          <Link to={post.slug}>{title}</Link>
        </h2>
        {excerpt && <p className="blog-card-excerpt">{excerpt}</p>}
        <Link to={post.slug} className="read-more">
          Read more →
        </Link>
      </div>
    </article>
  )
}