import { useEffect, useState, useCallback } from 'react'
import siteData from '../data/site-data.json'
import PageTitle from '../components/PageTitle'
import CollaboratorNav from '../components/CollaboratorNav'
import { assetUrl } from '../utils/assets'
import './StaticPage.css'
import './Students.css'

const LOGO_PATTERN = /logo|kwf_|kashmir_robotics/i
const GRADE_PATTERN = /^Grade\s*[-–]?\s*[IVXLC0-9]+/i

function getSrc(block) {
  return block.localSrc || block.src || ''
}

function normalizeSrc(src) {
  return src.replace(/_\(\d+\)(?=\.\w+$)/, '').toLowerCase()
}

function cleanLine(line) {
  return line.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

function collectUniqueImages(blocks) {
  const seen = new Set()
  const images = []
  for (const block of blocks) {
    if (block.type !== 'image') continue
    const src = getSrc(block)
    if (!src || LOGO_PATTERN.test(src)) continue
    const key = normalizeSrc(src)
    if (seen.has(key)) continue
    seen.add(key)
    images.push(src)
  }
  return images
}

function parseStudentRoster(blocks) {
  const html = blocks
    .filter((b) => b.type === 'html' || b.type === 'text')
    .map((b) => b.content || '')
    .join('\n\n')

  const lines = html
    .split(/\n+/)
    .map(cleanLine)
    .filter((line) => line && !/^name$/i.test(line))

  let usaName = null
  const bioParts = []
  const grades = []
  let currentGrade = null
  let section = null

  for (const line of lines) {
    if (/^USA$/i.test(line)) {
      section = 'usa'
      continue
    }
    if (/^Nepal$/i.test(line) || /^Members of STEM Club$/i.test(line)) {
      section = 'nepal'
      continue
    }
    if (GRADE_PATTERN.test(line)) {
      section = 'nepal'
      currentGrade = { title: line, names: [] }
      grades.push(currentGrade)
      continue
    }

    if (section === 'usa') {
      if (!usaName && line.length < 60 && line.split(' ').length <= 5 && !/[.!?]{2,}/.test(line)) {
        usaName = line
      } else if (line.length > 80 || /[.!?]/.test(line)) {
        bioParts.push(line)
      } else if (!usaName) {
        usaName = line
      } else {
        bioParts.push(line)
      }
      continue
    }

    if (currentGrade && line.length < 60 && !GRADE_PATTERN.test(line)) {
      currentGrade.names.push(line)
    }
  }

  return {
    usaName,
    bio: bioParts.join(' ').replace(/\s+/g, ' ').trim(),
    grades,
  }
}

function PhotoCarousel({ photos, label = 'Student photos' }) {
  const [index, setIndex] = useState(0)
  const count = photos.length

  const go = useCallback(
    (delta) => {
      if (!count) return
      setIndex((i) => (i + delta + count) % count)
    },
    [count]
  )

  useEffect(() => {
    if (count < 2) return undefined

    const onKey = (event) => {
      if (event.key === 'ArrowLeft') go(-1)
      if (event.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count, go])

  if (!count) return null

  return (
    <div className="photo-carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="photo-carousel-stage">
        {count > 1 && (
          <button
            type="button"
            className="photo-carousel-nav prev"
            onClick={() => go(-1)}
            aria-label="Previous photo"
          >
            ‹
          </button>
        )}

        <figure className="photo-carousel-frame">
          <img src={assetUrl(photos[index])} alt="" key={photos[index]} />
        </figure>

        {count > 1 && (
          <button
            type="button"
            className="photo-carousel-nav next"
            onClick={() => go(1)}
            aria-label="Next photo"
          >
            ›
          </button>
        )}
      </div>

      {count > 1 && (
        <>
          <p className="photo-carousel-status" aria-live="polite">
            {index + 1} / {count}
          </p>
          <div className="photo-carousel-thumbs" role="tablist" aria-label="Photo thumbnails">
            {photos.map((src, i) => (
              <button
                type="button"
                key={src}
                role="tab"
                aria-selected={i === index}
                className={`photo-carousel-thumb ${i === index ? 'active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
              >
                <img src={assetUrl(src)} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function Students() {
  const blocks = siteData.pages['/students-1']?.blocks || []
  const images = collectUniqueImages(blocks)
  const { usaName, bio, grades } = parseStudentRoster(blocks)

  const michaelPhoto = images[1]
  const stemPhotos = images.slice(2)

  return (
    <div>
      <div className="container">
        <PageTitle title="Students" />
      </div>
      <CollaboratorNav />
      <section className="static-page container students-page">
        <h3 className="content-heading">USA</h3>
        {usaName && <p className="student-lead-name">{usaName}</p>}
        {michaelPhoto && (
          <figure className="student-portrait">
            <img src={assetUrl(michaelPhoto)} alt={usaName || ''} />
          </figure>
        )}
        {bio && <p className="prose student-bio">{bio}</p>}

        <h3 className="content-heading">Nepal</h3>
        <h3 className="content-heading">Members of STEM Club</h3>

        <PhotoCarousel photos={stemPhotos} label="STEM Club student photos" />

        {grades.map((grade) => (
          <div key={grade.title} className="student-grade">
            <h3 className="content-heading">{grade.title}</h3>
            <ul className="name-grid student-name-list">
              {grade.names.map((name) => (
                <li key={name} className="person-card">
                  <span className="person-name">{name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  )
}
