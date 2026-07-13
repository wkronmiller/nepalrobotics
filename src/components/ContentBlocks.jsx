import { assetUrl } from '../utils/assets'
import './ContentBlocks.css'

const LOGO_PATTERN = /logo|kwf_|kashmir_robotics/i
const PERSON_PREFIX = /^(Mr\.|Mrs\.|Ms\.|Dr\.|Capt\.|Prof\.|Princess|Miss)\s/i
const GRADE_HEADING = /^Grade\s*[-–]?\s*[IVXLC0-9]+/i
const SECTION_HEADING =
  /^(USA|Nepal|Major Donors|Donors|Students|Advisers|Collaborators|Members of STEM Club)\b/i

function getImageSrc(block) {
  return assetUrl(block.localSrc || block.src)
}

function isLogoImage(block) {
  const src = getImageSrc(block) || ''
  return LOGO_PATTERN.test(src)
}

function normalizeSrc(src) {
  return (src || '').replace(/_\(\d+\)(?=\.\w+$)/, '').toLowerCase()
}

function linkifyText(text) {
  // URLs, emails, and bare domains (e.g. hobbyhangarva.com)
  const urlRegex =
    /(https?:\/\/[^\s);,]+|www\.[^\s);,]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+(?:\/[^\s);,]*)?)/gi
  const parts = []
  let lastIndex = 0
  let match

  while ((match = urlRegex.exec(text)) !== null) {
    // Avoid treating trailing periods of sentences as part of domain when already handled
    let raw = match[0]
    // Skip if this looks like a normal word with one dot that isn't a real TLD-ish domain
    if (!raw.includes('@') && !raw.includes('/') && !/^https?:/i.test(raw) && !raw.startsWith('www.')) {
      const labels = raw.split('.')
      if (labels.length < 2 || labels[labels.length - 1].length < 2) {
        continue
      }
    }

    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    let href = raw
    if (raw.includes('@') && !raw.includes('://')) {
      href = `mailto:${raw}`
    } else if (!/^https?:\/\//i.test(href)) {
      href = `https://${href}`
    }

    parts.push(
      <a key={`${match.index}-${raw}`} href={href} target="_blank" rel="noopener noreferrer">
        {raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '')}
      </a>
    )
    lastIndex = match.index + raw.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length ? parts : text
}

function parsePerson(text) {
  let main = text.trim()
  let contact = null

  const paren = main.match(/^(.+?)\s*\((.+)\)\s*$/)
  if (paren) {
    main = paren[1].trim()
    contact = paren[2]
      .replace(/\u00a0/g, ' ')
      // dual emails sometimes joined with /
      .replace(/(@[a-z0-9.-]+\.[a-z]{2,})\s*\/\s*/gi, '$1 · ')
      .split(/[;|]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .join(' · ')
  }

  // Keep academic credentials with the name: "Dr. Jane Doe, Ph.D"
  if (/,\s*(Ph\.D|J\.D|M\.D|Jr\.?|Sr\.?)\.?$/i.test(main)) {
    return { name: main, role: null, contact }
  }

  // "Mr. Name, Role / Affiliation"
  if (PERSON_PREFIX.test(main) && main.includes(',')) {
    // "Dr. Name, Ph.D, Some Role"
    const withCred = main.match(/^(.+?,\s*(?:Ph\.D|J\.D|M\.D)\.?)\s*,\s*(.+)$/i)
    if (withCred) {
      return { name: withCred[1].trim(), role: withCred[2].trim(), contact }
    }
    const idx = main.indexOf(',')
    return {
      name: main.slice(0, idx).trim(),
      role: main.slice(idx + 1).trim(),
      contact,
    }
  }

  return { name: main, role: null, contact }
}

function renderPersonCard(text) {
  const { name, role, contact } = parsePerson(text)
  return (
    <>
      <span className="person-name">{name}</span>
      {role && <span className="person-role">{role}</span>}
      {contact && <span className="person-meta">{linkifyText(contact)}</span>}
    </>
  )
}

function isSkipLine(text) {
  return !text || /^name$/i.test(text)
}

function isSectionHeading(text) {
  if (PERSON_PREFIX.test(text)) return false
  if (/@|https?:\/\//i.test(text)) return false
  if (text.includes(';')) return false
  if (isSkipLine(text)) return false
  if (GRADE_HEADING.test(text)) return true
  if (SECTION_HEADING.test(text) && text.length < 80) return true
  return false
}

function isPersonEntry(text) {
  if (!text || text.length > 200) return false
  if (isSectionHeading(text) || isSkipLine(text)) return false
  if (PERSON_PREFIX.test(text)) return true

  // Email / parenthetical contact
  if (text.length < 140 && (/@[a-z0-9.-]+\.[a-z]{2,}/i.test(text) || /\([^)]+\)$/.test(text))) {
    return true
  }

  // Plain personal name: 2–5 words
  const words = text.split(/\s+/).filter(Boolean)
  if (
    words.length >= 2 &&
    words.length <= 5 &&
    text.length < 50 &&
    !/[!?]/.test(text) &&
    !/https?:\/\//i.test(text) &&
    !text.includes('@')
  ) {
    return true
  }

  return false
}

function classifyLine(text) {
  const trimmed = text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  if (isSkipLine(trimmed)) return null
  if (isSectionHeading(trimmed)) return { type: 'heading', text: trimmed }
  if (isPersonEntry(trimmed)) return { type: 'name', text: trimmed }
  return { type: 'paragraph', text: trimmed }
}

function classifyChunk(text) {
  const trimmed = text.replace(/\u00a0/g, ' ').trim()
  if (!trimmed) return []

  const lines = trimmed
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  // Multi-line roster (grades / name lists): classify each line
  if (lines.length >= 2) {
    const rosterish = lines.filter(
      (l) => isSectionHeading(l) || isPersonEntry(l) || isSkipLine(l) || l.length < 60
    )
    if (rosterish.length >= Math.ceil(lines.length * 0.6)) {
      return lines.map(classifyLine).filter(Boolean)
    }
  }

  const single = classifyLine(trimmed)
  return single ? [single] : []
}

function renderClassified(classified, keyPrefix) {
  if (!classified.length) return null

  const elements = []
  let nameBuffer = []

  const flushNames = () => {
    if (!nameBuffer.length) return
    const items = nameBuffer
    nameBuffer = []
    elements.push(
      <ul key={`${keyPrefix}-names-${elements.length}`} className="name-grid">
        {items.map((name, i) => (
          <li key={i}>{renderPersonCard(name)}</li>
        ))}
      </ul>
    )
  }

  classified.forEach((item, i) => {
    if (item.type === 'name') {
      nameBuffer.push(item.text)
      return
    }
    flushNames()

    if (item.type === 'heading') {
      elements.push(
        <h3 key={`${keyPrefix}-h-${i}`} className="content-heading">
          {item.text}
        </h3>
      )
    } else {
      elements.push(
        <p key={`${keyPrefix}-p-${i}`}>{linkifyText(item.text)}</p>
      )
    }
  })
  flushNames()

  return elements
}

function renderTextBlock(content, key) {
  const chunks = content
    .split(/\n\n+/)
    .map((c) => c.replace(/\u00a0/g, ' ').trim())
    .filter(Boolean)

  const classified = chunks.flatMap(classifyChunk)
  const elements = renderClassified(classified, key)
  if (!elements?.length) return null

  return (
    <div key={key} className="prose content-text">
      {elements}
    </div>
  )
}

export default function ContentBlocks({ blocks, hideLogos = true, portraitImages = false }) {
  if (!blocks?.length) return null

  const htmlBlocks = blocks.filter((b) => b.type === 'html' || b.type === 'text')

  const seen = new Set()
  const imageBlocks = blocks.filter((b) => {
    if (b.type !== 'image') return false
    if (hideLogos && isLogoImage(b)) return false
    const src = getImageSrc(b)
    const key = normalizeSrc(src)
    if (!src || seen.has(key)) return false
    seen.add(key)
    return true
  })

  return (
    <div className="content-blocks">
      {htmlBlocks.map((block, i) => renderTextBlock(block.content || '', i))}

      {imageBlocks.length > 0 && (
        <div className={`content-images ${portraitImages ? 'portraits' : ''}`}>
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
