import { NavLink } from 'react-router-dom'
import './CollaboratorNav.css'

const items = [
  { label: 'Advisers', path: '/collaborators/advisers' },
  { label: 'Students', path: '/collaborators/students' },
  { label: 'Donors', path: '/collaborators/donors' },
]

export default function CollaboratorNav() {
  return (
    <nav className="collaborator-nav container" aria-label="Collaborators">
      <ul>
        {items.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
