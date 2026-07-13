import { Link } from 'react-router-dom'
import siteData from '../data/site-data.json'
import ImageGallery from '../components/ImageGallery'
import BlogCard from '../components/BlogCard'
import { assetUrl } from '../utils/assets'
import './Home.css'

// Everest summit photo from the original Squarespace gallery
const HERO_IMAGE = '/images/gallery/mck_nepal_2017_rev._1_everest_summit_best_DSC_7297.jpg'

export default function Home() {
  const homeBlocks = siteData.pages['/']?.blocks || []
  // Prefer the long project description over short section labels like "USA Updates"
  const intro =
    homeBlocks
      .filter((b) => b.type === 'html')
      .sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0))[0] || null
  const galleryImages = homeBlocks.filter((b) => b.type === 'image')
  const usaPosts = siteData.posts?.filter((p) => p.collection === 'usa').slice(0, 3) || []
  const nepalPosts = siteData.posts?.filter((p) => p.collection === 'nepal').slice(0, 3) || []

  return (
    <div className="home">
      <section
        className="hero"
        style={{ backgroundImage: `url(${assetUrl(HERO_IMAGE)})` }}
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
            <ImageGallery
              images={galleryImages.filter(
                (img) => !/logo|kwf_|kashmir_robotics/i.test(img.localSrc || img.src || '')
              )}
            />
          </div>
        </section>
      )}
    </div>
  )
}
