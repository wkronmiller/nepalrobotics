import { Navigate, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import UsaUpdates from './pages/UsaUpdates'
import NepalUpdates from './pages/NepalUpdates'
import BlogPost from './pages/BlogPost'
import Advisers from './pages/Advisers'
import Students from './pages/Students'
import Donors from './pages/Donors'
import RelatedLinks from './pages/RelatedLinks'
import RelatedVideos from './pages/RelatedVideos'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/usa-updates" element={<UsaUpdates />} />
        <Route path="/usa-updates/*" element={<BlogPost collection="usa" />} />
        <Route path="/nepal-updates" element={<NepalUpdates />} />
        <Route path="/nepal-updates/*" element={<BlogPost collection="nepal" />} />

        {/* Collaborators group (matches original Squarespace structure) */}
        <Route path="/collaborators" element={<Navigate to="/collaborators/advisers" replace />} />
        <Route path="/collaborators/advisers" element={<Advisers />} />
        <Route path="/collaborators/advisors" element={<Navigate to="/collaborators/advisers" replace />} />
        <Route path="/collaborators/students" element={<Students />} />
        <Route path="/collaborators/donors" element={<Donors />} />

        {/* Legacy Squarespace URLs */}
        <Route path="/advisers" element={<Navigate to="/collaborators/advisers" replace />} />
        <Route path="/students-1" element={<Navigate to="/collaborators/students" replace />} />
        <Route path="/students" element={<Navigate to="/collaborators/advisers" replace />} />
        <Route path="/donors" element={<Navigate to="/collaborators/donors" replace />} />

        <Route path="/related-links" element={<RelatedLinks />} />
        <Route path="/related-videos" element={<RelatedVideos />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
