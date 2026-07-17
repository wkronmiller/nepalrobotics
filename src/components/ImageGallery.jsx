import { useEffect, useRef, useState } from 'react'
import { assetUrl, imageAlt } from '../utils/assets'
import ResponsiveImage from './ResponsiveImage'
import './ImageGallery.css'

function getImageSource(block) {
  return block.localSrc || block.src
}

function getImageSrc(block) {
  return assetUrl(getImageSource(block))
}

function getImageAlt(image) {
  const alt = typeof image.alt === 'string' ? image.alt.trim() : ''
  return alt || imageAlt(getImageSource(image))
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function ImageGallery({ images }) {
  const [lightbox, setLightbox] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  const closeLightbox = () => setLightbox(null)
  const openLightbox = (index, event) => {
    previousFocusRef.current = event.currentTarget
    setLightbox(index)
  }

  const moveLightbox = (delta) => {
    setLightbox((current) => {
      if (current === null || images.length < 2) return current
      return (current + delta + images.length) % images.length
    })
  }

  const isOpen = lightbox !== null

  useEffect(() => {
    if (!isOpen) {
      previousFocusRef.current?.focus()
      previousFocusRef.current = null
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus({ preventScroll: true })

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeLightbox()
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        moveLightbox(-1)
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        moveLightbox(1)
        return
      }
      if (event.key !== 'Tab') return

      const focusable = [...dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || []]
      if (!focusable.length) {
        event.preventDefault()
        dialogRef.current?.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, images.length])

  useEffect(() => {
    if (!isOpen || lightbox === null) {
      setAnnouncement('')
      return undefined
    }

    setAnnouncement('')
    const frame = window.requestAnimationFrame(() => {
      const image = images[lightbox]
      if (!image) return
      setAnnouncement(
        `Image ${lightbox + 1} of ${images.length}: ${
          getImageAlt(image) || 'Nepal Robotics project photo'
        }`,
      )
    })
    return () => window.cancelAnimationFrame(frame)
  }, [isOpen, lightbox, images.length])

  if (!images?.length) return null

  return (
    <>
      <div className="image-gallery">
        {images.map((img, i) => (
          <button
            type="button"
            key={i}
            className="gallery-item"
            onClick={(event) => openLightbox(i, event)}
            aria-label={
              img.alt?.trim()
                ? `View ${img.alt} in full size`
                : `Open project image ${i + 1} of ${images.length}`
            }
          >
            <ResponsiveImage
              src={getImageSource(img)}
              alt={getImageAlt(img)}
              loading="lazy"
              sizes="(max-width: 493px) calc(100vw - 2.5rem), (max-width: 727px) calc((100vw - 3.35rem) / 2), (max-width: 767px) calc((100vw - 4.2rem) / 3), (max-width: 976px) calc((100vw - 5.2rem) / 3), (max-width: 1119px) calc((100vw - 6.05rem) / 4), 256px"
            />
          </button>
        ))}
      </div>

      {isOpen && (
        <div
          ref={dialogRef}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          aria-describedby="lightbox-status"
          tabIndex={-1}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeLightbox()
          }}
        >
          <button
            type="button"
            ref={closeButtonRef}
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Close image preview"
          >
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox-nav prev"
                onClick={() => moveLightbox(-1)}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                className="lightbox-nav next"
                onClick={() => moveLightbox(1)}
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}
          <p id="lightbox-status" className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {announcement}
          </p>
          <img
            src={getImageSrc(images[lightbox])}
            alt={getImageAlt(images[lightbox])}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
