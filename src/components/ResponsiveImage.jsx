import { assetUrl, responsiveImageSrcSet } from '../utils/assets'

export default function ResponsiveImage({
  src,
  alt = '',
  sizes = '100vw',
  widths,
  pictureClassName,
  onError,
  ...imageProps
}) {
  const srcSet = responsiveImageSrcSet(src, widths)
  const fallbackSrc = assetUrl(src)
  const handleError = (event) => {
    if (event.currentTarget.dataset.responsiveFallback === 'true') {
      onError?.(event)
      return
    }

    event.currentTarget.dataset.responsiveFallback = 'true'
    event.currentTarget.removeAttribute('srcset')
    event.currentTarget.parentElement?.querySelector('source')?.remove()
    event.currentTarget.src = fallbackSrc
    onError?.(event)
  }
  const image = (
    <img
      src={fallbackSrc}
      alt={alt}
      {...imageProps}
      onError={srcSet ? handleError : onError}
    />
  )

  if (!srcSet) return image

  return (
    <picture className={pictureClassName}>
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      {image}
    </picture>
  )
}
