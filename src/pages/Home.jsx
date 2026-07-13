import { Link } from 'react-router-dom'
import siteData from '../data/site-data.json'
import ImageGallery from '../components/ImageGallery'
import BlogCard from '../components/BlogCard'
import './Home.css'

export default function Home() {
  const homeBlocks = siteData.pages['/']?.blocks || []
  const intro = homeBlocks.find((b) => b.type === 'html')
  const galleryImages = homeBlocks.filter((b) => b.type === 'image')
  const usaPosts = siteData.posts?.filter((p) => p.collection === 'usa').slice(0, 3) || []
  const nepalPosts = siteData.posts?.filter((p) => p.collection === 'nepal').slice(0, 3) || []
  const heroImage = galleryImages[0]?.localSrc || galleryImages[0]?.src

  return (
    <div className="home">
      <section
        className="hero"
        style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
      >
        <div className="hero-overlay">
          <div className="container hero-content">
            <h1>{siteData.meta.title}</h1>
            <p className="hero-tagline">{siteData.meta.tagline}</p>
            <div className="hero-actions">
              <Link to="/usa-updates" className="btn btn-primary">
                USA Updates
              </Link>
              <Link to="/nepal-updates" className="btn btn-outline hero-btn-outline">
                Nepal Updates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {intro && (
        <section className="intro-section">
          <div className="container">
            <div className="intro-content prose">
              {intro.content.split('\n\n').map((para, i) => (
                <p key={i}>
                  {para.includes('@nepalrobotics') ? (
                    <>
                      {para.split('@nepalrobotics')[0]}
                      <a href="https://twitter.com/nepalrobotics" target="_blank" rel="noopener noreferrer">
                        @nepalrobotics
                      </a>
                      {para.split('@nepalrobotics')[1]}
                    </>
                  ) : (
                    para
                  )}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {usaPosts.length > 0 && (
        <section className="updates-section">
          <div className="container">
            <div className="section-header">
              <h2>USA Updates</h2>
              <Link to="/usa-updates" className="view-all">View all →</Link>
            </div>
            <div className="blog-grid">
              {usaPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {nepalPosts.length > 0 && (
        <section className="updates-section alt">
          <div className="container">
            <div className="section-header">
              <h2>Nepal Updates</h2>
              <Link to="/nepal-updates" className="view-all">View all →</Link>
            </div>
            <div className="blog-grid">
              {nepalPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {galleryImages.length > 0 && (
        <section className="gallery-section">
          <div className="container">
            <h2>Project Gallery</h2>
            <ImageGallery images={galleryImages} />
          </div>
        </section>
      )}
    </div>
  )
}