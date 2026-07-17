import { Link } from 'react-router-dom'
import { assetUrl } from '../utils/assets'
import ResponsiveImage from './ResponsiveImage'
import { getPostDate } from '../utils/seo'
import './BlogCard.css'

function getThumbnail(post) {
  if (post.thumbnailLocal || post.thumbnail) {
    return post.thumbnailLocal || post.thumbnail
  }

  const imageBlock = post.blocks?.find((block) => block.type === 'image')
  if (imageBlock?.localSrc || imageBlock?.src) {
    return imageBlock.localSrc || imageBlock.src
  }

  const videoBlock = post.blocks?.find((block) => block.type === 'video' && block.youtubeId)
  if (videoBlock) {
    return `https://img.youtube.com/vi/${videoBlock.youtubeId}/hqdefault.jpg`
  }

  return null
}

function getExcerpt(post) {
  const sourceText =
    post.blocks?.find((block) => block.type === 'text')?.content || post.excerpt || ''
  const normalizedText = sourceText.replace(/\s+/g, ' ').trim()

  if (normalizedText) {
    return normalizedText.length > 200
      ? `${normalizedText.slice(0, 200).trimEnd()}…`
      : normalizedText
  }

  if (post.blocks?.some((block) => block.type === 'video')) {
    return 'Video update — watch the full recording.'
  }

  return ''
}

export default function BlogCard({ post }) {
  const title = post.title?.trim() || 'Project update'
  const thumbnail = getThumbnail(post)
  const thumb = assetUrl(thumbnail)
  const excerpt = getExcerpt(post)

  return (
    <article className="blog-card">
      {thumb && (
        <Link
          to={post.slug}
          className="blog-card-image"
          tabIndex={-1}
          aria-hidden="true"
        >
          <ResponsiveImage
            src={thumbnail}
            alt=""
            loading="lazy"
            sizes="(max-width: 600px) calc(100vw - 2.5rem), 337px"
          />
        </Link>
      )}
      <div className="blog-card-body">
        {post.date && (
          <time className="blog-card-date" dateTime={getPostDate(post)}>
            {post.date}
          </time>
        )}
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