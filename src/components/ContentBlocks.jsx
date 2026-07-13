import './ContentBlocks.css'

function getImageSrc(block) {
  return block.localSrc || block.src
}

export default function ContentBlocks({ blocks }) {
  if (!blocks?.length) return null

  const htmlBlocks = blocks.filter((b) => b.type === 'html' || b.type === 'text')
  const imageBlocks = blocks.filter((b) => b.type === 'image')

  return (
    <div className="content-blocks">
      {htmlBlocks.map((block, i) => (
        <div key={i} className="prose content-text">
          {block.content.split('\n\n').map((para, j) => (
            <p key={j}>{para}</p>
          ))}
        </div>
      ))}

      {imageBlocks.length > 0 && (
        <div className="content-images">
          {imageBlocks.map((block, i) => (
            <figure key={i} className="content-image">
              <img src={getImageSrc(block)} alt={block.alt || ''} loading="lazy" />
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}