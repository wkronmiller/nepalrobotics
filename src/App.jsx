import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import UsaUpdates from './pages/UsaUpdates'
import NepalUpdates from './pages/NepalUpdates'
import BlogPost from './pages/BlogPost'
import Collaborators from './pages/Collaborators'
import Advisers from './pages/Advisers'
import Students from './pages/Students'
import Donors from './pages/Donors'
import RelatedLinks from './pages/RelatedLinks'
import RelatedVideos from './pages/RelatedVideos'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/usa-updates" element={<UsaUpdates />} />
        <Route path="/usa-updates/*" element={<BlogPost collection="usa" />} />
        <Route path="/nepal-updates" element={<NepalUpdates />} />
        <Route path="/nepal-updates/*" element={<BlogPost collection="nepal" />} />
        <Route path="/collaborators" element={<Collaborators />} />
        <Route path="/students" element={<Collaborators />} />
        <Route path="/advisers" element={<Advisers />} />
        <Route path="/students-1" element={<Students />} />
        <Route path="/donors" element={<Donors />} />
        <Route path="/related-links" element={<RelatedLinks />} />
        <Route path="/related-videos" element={<RelatedVideos />} />
      </Routes>
    </Layout>
  )
}