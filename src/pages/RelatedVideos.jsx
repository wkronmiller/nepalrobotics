import siteData from '../data/site-data.json'
import PageTitle from '../components/PageTitle'
import './StaticPage.css'
import './RelatedVideos.css'

export default function RelatedVideos() {
  const videos = siteData.videos || []

  return (
    <section className="static-page container">
      <PageTitle title="Related Videos" />
        {videos.length === 0 ? (
          <p className="prose">No related videos available.</p>
        ) : (
          <div className="videos-grid">
            {videos.map((video, i) => (
              <article key={i} className="video-card">
                {video.youtubeId ? (
                  <div className="video-embed">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                ) : video.url ? (
                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="video-link">
                    Watch video
                  </a>
                ) : null}
                <h3>{video.title}</h3>
                {video.description && <p>{video.description}</p>}
              </article>
            ))}
          </div>
        )}
    </section>
  )
}