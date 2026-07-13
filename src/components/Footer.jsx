import siteData from '../data/site-data.json'
import './Footer.css'

export default function Footer() {
  const { meta } = siteData

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <h3>{meta.title}</h3>
          <p>{meta.tagline}</p>
        </div>

        <div className="footer-social">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href={`https://twitter.com/${meta.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
              Twitter
            </a>
            <a href={meta.youtube} target="_blank" rel="noopener noreferrer">
              YouTube
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} Nepal Robotics Project. All rights reserved.</p>
      </div>
    </footer>
  )
}