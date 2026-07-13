import './PageHeader.css'

export default function PageHeader({ title, subtitle, image }) {
  return (
    <section
      className="page-header"
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      <div className="page-header-overlay">
        <div className="container">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
    </section>
  )
}