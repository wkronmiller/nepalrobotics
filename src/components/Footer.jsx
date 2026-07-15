import siteData from '../data/site-data.json'
import './Footer.css'

export default function Footer() {
  const { meta } = siteData

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <h2>{meta.title}</h2>
          <p>{meta.tagline}</p>
        </div>

        <div className="footer-social">
          <h2>Follow Us</h2>
          <div className="social-links">
            <a href={`https://twitter.com/${meta.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
              Twitter<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={meta.youtube} target="_blank" rel="noopener noreferrer">
              YouTube<span className="sr-only"> (opens in a new tab)</span>
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