import siteData from '../data/site-data.json'
import PageHeader from '../components/PageHeader'
import './StaticPage.css'
import './RelatedVideos.css'

export default function RelatedVideos() {
  const videos = siteData.videos || []

  return (
    <div>
      <PageHeader title="Related Videos" subtitle="Videos related to the Nepal Robotics Project" />
      <section className="static-page container">
        <div className="videos-grid">
          {videos.map((video, i) => (
            <div key={i} className="video-card">
              {video.youtubeId ? (
                <div className="video-embed">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : video.url ? (
                <a href={video.url} target="_blank" rel="noopener noreferrer" className="video-link">
                  {video.title}
                </a>
              ) : null}
              <h3>{video.title}</h3>
              {video.description && <p>{video.description}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}