import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import siteData from '../data/site-data.json'
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
  const menuButtonRef = useRef(null)
  const dropdownButtonRefs = useRef({})

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
    const main = document.querySelector('.main-content')
    const footer = document.querySelector('.footer')
    document.body.style.overflow = menuOpen && isMobile ? 'hidden' : ''

    if (menuOpen && isMobile) {
      main?.setAttribute('inert', '')
      footer?.setAttribute('inert', '')
    }

    return () => {
      document.body.style.overflow = ''
      main?.removeAttribute('inert')
      footer?.removeAttribute('inert')
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen && !openDropdown) return undefined

    const onPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setOpenDropdown(null)
        setMenuOpen(false)
      }
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        const trigger = openDropdown ? dropdownButtonRefs.current[openDropdown] : null
        setOpenDropdown(null)
        setMenuOpen(false)
        const isMobile = window.matchMedia(MOBILE_MQ).matches
        const focusTarget = isMobile ? menuButtonRef.current : (trigger || menuButtonRef.current)
        focusTarget?.focus()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen, openDropdown])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const isGroupActive = (children) =>
    children.some((child) => isActive(child.path))

  const closeNavigation = (desktopTarget, restoreFocus) => {
    setMenuOpen(false)
    setOpenDropdown(null)
    if (!restoreFocus) return

    window.requestAnimationFrame(() => {
      const isMobile = window.matchMedia(MOBILE_MQ).matches
      const focusTarget = isMobile ? menuButtonRef.current : desktopTarget
      focusTarget?.focus()
    })
  }

  return (
    <header className="header" ref={headerRef}>
      <div className="header-inner container">
        <Link
          to="/"
          className="site-brand"
          onClick={(event) => closeNavigation(event.currentTarget, location.pathname === '/')}
        >
          <span className="site-brand-text">
            <span className="site-title">{siteData.meta.title}</span>
            <span className="site-tagline">{siteData.meta.tagline}</span>
          </span>
        </Link>

        <button
          type="button"
          ref={menuButtonRef}
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => {
            setMenuOpen((open) => !open)
            setOpenDropdown(null)
          }}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-controls="site-navigation"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="site-navigation" className={`nav ${menuOpen ? 'open' : ''}`} aria-label="Main">
          <ul className="nav-list">
            {navItems.map((item) =>
              item.children ? (
                <li
                  key={item.label}
                  className={`nav-item has-dropdown ${openDropdown === item.label ? 'open' : ''}`}
                >
                  <button
                    type="button"
                    ref={(node) => {
                      dropdownButtonRefs.current[item.label] = node
                    }}
                    className={`nav-link dropdown-label ${isGroupActive(item.children) ? 'active' : ''}`}
                    aria-controls={`dropdown-${item.label.toLowerCase()}`}
                    aria-expanded={openDropdown === item.label}
                    onClick={() =>
                      setOpenDropdown((current) => (current === item.label ? null : item.label))
                    }
                  >
                    {item.label}
                  </button>
                  <ul id={`dropdown-${item.label.toLowerCase()}`} className="dropdown">
                    {item.children.map((child) => (
                      <li key={child.path}>
                        <Link
                          to={child.path}
                          className={isActive(child.path) ? 'active' : ''}
                          aria-current={isActive(child.path) ? 'page' : undefined}
                          onClick={() =>
                            closeNavigation(
                              dropdownButtonRefs.current[item.label],
                              location.pathname === child.path,
                            )
                          }
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
                    aria-current={isActive(item.path) ? 'page' : undefined}
                    onClick={(event) =>
                      closeNavigation(event.currentTarget, location.pathname === item.path)
                    }
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
