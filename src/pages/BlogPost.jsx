import { useLocation, Link } from 'react-router-dom'
import siteData from '../data/site-data.json'
import { assetUrl } from '../utils/assets'
import { getPostDate, normalizePath } from '../utils/seo'
import './BlogPost.css'

function getImageSrc(block) {
  return assetUrl(block.localSrc || block.src)
}

function getImageAlt(block, fallback) {
  const alt = typeof block.alt === 'string' ? block.alt.trim() : ''
  return alt || fallback
}

export default function BlogPost({ collection }) {
  const location = useLocation()
  const pathname = normalizePath(location.pathname, import.meta.env.BASE_URL)
  const post = siteData.posts?.find(
    (candidate) => candidate.slug === pathname && candidate.collection === collection,
  )

  if (!post) {
    return (
      <div className="container blog-not-found">
        <h1>Post not found</h1>
        <Link to={collection === 'usa' ? '/usa-updates' : '/nepal-updates'}>
          ← Back to updates
        </Link>
      </div>
    )
  }

  const backPath = collection === 'usa' ? '/usa-updates' : '/nepal-updates'
  const backLabel = collection === 'usa' ? 'USA Updates' : 'Nepal Updates'
  const title = post.title?.trim() || 'Project update'

  return (
    <article className="blog-post">
      <header className="blog-post-header">
        <div className="container">
          <Link to={backPath} className="back-link">← {backLabel}</Link>
          <h1>{title}</h1>
          {post.date && (
            <time className="blog-post-date" dateTime={getPostDate(post)}>
              {post.date}
            </time>
          )}
        </div>
      </header>

      <div className="container">
        <div className="blog-post-body">
          {post.blocks?.map((block, i) => {
            if (block.type === 'text') {
              return (
                <div key={i} className="prose blog-text">
                  {block.content.split('\n\n').map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              )
            }
            if (block.type === 'image') {
              return (
                <figure key={i} className="blog-image">
                  <img src={getImageSrc(block)} alt={getImageAlt(block, `${title} image`)} loading="lazy" />
                </figure>
              )
            }
            if (block.type === 'video') {
              return (
                <div key={i} className="blog-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${block.youtubeId}`}
                    title={`${title} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              )
            }
            return null
          })}
        </div>
      </div>
    </article>
  )
}