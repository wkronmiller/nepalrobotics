import { useEffect, useState } from 'react'
import { assetUrl } from '../utils/assets'
import './ImageGallery.css'

function getImageSrc(block) {
  return assetUrl(block.localSrc || block.src)
}

export default function ImageGallery({ images }) {
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    if (lightbox === null) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setLightbox(null)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [lightbox])

  if (!images?.length) return null

  return (
    <>
      <div className="image-gallery">
        {images.map((img, i) => (
          <button
            type="button"
            key={i}
            className="gallery-item"
            onClick={() => setLightbox(i)}
            aria-label={`View image ${i + 1}`}
          >
            <img src={getImageSrc(img)} alt={img.alt || ''} loading="lazy" />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Image preview" onClick={() => setLightbox(null)}>
          <button type="button" className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">
            ×
          </button>
          <button
            type="button"
            className="lightbox-nav prev"
            onClick={(e) => {
              e.stopPropagation()
              setLightbox((lightbox - 1 + images.length) % images.length)
            }}
            aria-label="Previous"
          >
            ‹
          </button>
          <img
            src={getImageSrc(images[lightbox])}
            alt={images[lightbox].alt || ''}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="lightbox-nav next"
            onClick={(e) => {
              e.stopPropagation()
              setLightbox((lightbox + 1) % images.length)
            }}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}