import { Link } from 'react-router-dom'
import './BlogPost.css'

export default function NotFound() {
  return (
    <section className="container blog-not-found">
      <h1>Page not found</h1>
      <p>The page you requested does not exist or has moved.</p>
      <Link to="/">Return home</Link>
    </section>
  )
}
