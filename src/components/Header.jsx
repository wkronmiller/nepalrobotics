import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import siteData from '../data/site-data.json'
import './Header.css'

const navItems = [
  { label: 'Home', path: '/' },
  {
    label: 'Related Links',
    children: [
      { label: 'Related Links', path: '/related-links' },
      { label: 'Related Videos', path: '/related-videos' },
    ],
  },
  { label: 'USA Updates', path: '/usa-updates' },
  { label: 'Nepal Updates', path: '/nepal-updates' },
  { label: 'Collaborators', path: '/collaborators' },
  { label: 'Advisers', path: '/advisers' },
  { label: 'Students', path: '/students-1' },
  { label: 'Donors', path: '/donors' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="header">
      <div className="header-inner container">
        <Link to="/" className="site-brand" onClick={() => setMenuOpen(false)}>
          <span className="site-title">{siteData.meta.title}</span>
          <span className="site-tagline">{siteData.meta.tagline}</span>
        </Link>

        <button
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            {navItems.map((item) =>
              item.children ? (
                <li key={item.label} className="nav-item has-dropdown">
                  <span className="nav-link dropdown-label">{item.label}</span>
                  <ul className="dropdown">
                    {item.children.map((child) => (
                      <li key={child.path}>
                        <Link
                          to={child.path}
                          className={isActive(child.path) ? 'active' : ''}
                          onClick={() => setMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}