import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import SEO from './SEO'
import './Layout.css'

export default function Layout({ children }) {
  const location = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    const previousScrollBehavior = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = 'auto'
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    mainRef.current?.focus({ preventScroll: true })

    const frame = window.requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior
    })
    return () => {
      window.cancelAnimationFrame(frame)
      document.documentElement.style.scrollBehavior = previousScrollBehavior
    }
  }, [location.pathname])

  return (
    <div className="layout">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SEO />
      <Header />
      <main id="main-content" className="main-content" ref={mainRef} tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  )
}