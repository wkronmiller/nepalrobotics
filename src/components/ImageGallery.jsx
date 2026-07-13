import { useState } from 'react'
import './ImageGallery.css'

function getImageSrc(block) {
  return block.localSrc || block.src
}

export default function ImageGallery({ images }) {
  const [lightbox, setLightbox] = useState(null)

  if (!images?.length) return null

  return (
    <>
      <div className="image-gallery">
        {images.map((img, i) => (
          <button
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
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">
            ×
          </button>
          <button
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