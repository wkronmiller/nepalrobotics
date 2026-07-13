import { useLocation, Link } from 'react-router-dom'
import siteData from '../data/site-data.json'
import './BlogPost.css'

function getImageSrc(block) {
  return block.localSrc || block.src
}

export default function BlogPost({ collection }) {
  const location = useLocation()
  const post = siteData.posts?.find((p) => p.slug === location.pathname)

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

  return (
    <article className="blog-post">
      <header className="blog-post-header">
        <div className="container">
          <Link to={backPath} className="back-link">← {backLabel}</Link>
          <h1>{post.title}</h1>
          {post.date && <time className="blog-post-date">{post.date}</time>}
        </div>
      </header>

      <div className="container blog-post-body">
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
                <img src={getImageSrc(block)} alt={block.alt || ''} loading="lazy" />
              </figure>
            )
          }
          if (block.type === 'video') {
            return (
              <div key={i} className="blog-video">
                <iframe
                  src={`https://www.youtube.com/embed/${block.youtubeId}`}
                  title="Embedded video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )
          }
          return null
        })}
      </div>
    </article>
  )
}