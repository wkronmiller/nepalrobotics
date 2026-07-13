import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import siteData from '../data/site-data.json'
import { assetUrl } from '../utils/assets'
import './Header.css'

const MOBILE_MQ = '(max-width: 1024px)'

const navItems = [
  { label: 'Home', path: '/' },
  {
    label: 'Related',
    children: [
      { label: 'Related Links', path: '/related-links' },
      { label: 'Related Videos', path: '/related-videos' },
    ],
  },
  { label: 'USA Updates', path: '/usa-updates' },
  { label: 'Nepal Updates', path: '/nepal-updates' },
  {
    label: 'Collaborators',
    children: [
      { label: 'Advisers', path: '/collaborators/advisers' },
      { label: 'Students', path: '/collaborators/students' },
      { label: 'Donors', path: '/collaborators/donors' },
    ],
  },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const location = useLocation()
  const headerRef = useRef(null)

  useEffect(() => {
    setMenuOpen(false)
    setOpenDropdown(null)
  }, [location.pathname])

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const onChange = () => {
      if (!mq.matches) {
        setMenuOpen(false)
        setOpenDropdown(null)
      }
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const isMobile = window.matchMedia(MOBILE_MQ).matches
    document.body.style.overflow = menuOpen && isMobile ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (!openDropdown) return undefined

    const onPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setOpenDropdown(null)
      }
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpenDropdown(null)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openDropdown])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const isGroupActive = (children) =>
    children.some((child) => isActive(child.path))

  return (
    <header className="header" ref={headerRef}>
      <div className="header-inner container">
        <Link to="/" className="site-brand" onClick={() => setMenuOpen(false)}>
          <img
            src={assetUrl('/images/logos/logo.png')}
            alt=""
            className="site-logo"
            width={48}
            height={36}
          />
          <span className="site-brand-text">
            <span className="site-title">{siteData.meta.title}</span>
            <span className="site-tagline">{siteData.meta.tagline}</span>
          </span>
        </Link>

        <button
          type="button"
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav ${menuOpen ? 'open' : ''}`} aria-label="Main">
          <ul className="nav-list">
            {navItems.map((item) =>
              item.children ? (
                <li
                  key={item.label}
                  className={`nav-item has-dropdown ${openDropdown === item.label ? 'open' : ''}`}
                >
                  <button
                    type="button"
                    className={`nav-link dropdown-label ${isGroupActive(item.children) ? 'active' : ''}`}
                    aria-expanded={openDropdown === item.label}
                    aria-haspopup="true"
                    onClick={() =>
                      setOpenDropdown((current) => (current === item.label ? null : item.label))
                    }
                  >
                    {item.label}
                  </button>
                  <ul className="dropdown">
                    {item.children.map((child) => (
                      <li key={child.path}>
                        <Link
                          to={child.path}
                          className={isActive(child.path) ? 'active' : ''}
                          onClick={() => {
                            setMenuOpen(false)
                            setOpenDropdown(null)
                          }}
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
