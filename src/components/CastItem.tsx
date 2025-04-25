import React from 'react';
import { Cast } from '../services/types';

interface CastItemProps {
  cast: Cast;
}

const CastItem: React.FC<CastItemProps> = ({ cast }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Function to render embeds (images, urls, videos, etc.)
  const renderEmbeds = () => {
    if (!cast.embeds) return null;

    return (
      <>
        {/* Render images */}
        {cast.embeds.images && cast.embeds.images.length > 0 && (
          <div className="cast-images">
            {cast.embeds.images.map((image, idx) => (
              <img 
                key={`${image.url}-${idx}`} 
                src={image.url} 
                alt={image.title || 'Embedded image'} 
                className="cast-image"
              />
            ))}
          </div>
        )}

        {/* Render URL cards */}
        {cast.embeds.urls && cast.embeds.urls.length > 0 && (
          <div className="cast-urls">
            {cast.embeds.urls.map((url, idx) => (
              <a 
                key={`${url.url}-${idx}`} 
                href={url.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="url-embed"
              >
                {url.imageUrl && (
                  <img src={url.imageUrl} alt={url.title || 'Link preview'} className="url-image" />
                )}
                <div className="url-content">
                  <h4>{url.title || url.url}</h4>
                  {url.description && <p>{url.description}</p>}
                </div>
              </a>
            ))}
          </div>
        )}
      </>
    );
  };

  if (!cast) return null;

  return (
    <div className="cast-item">
      <div className="cast-header">
        <div className="cast-author">
          {cast.author?.pfpUrl && (
            <img 
              src={cast.author.pfpUrl} 
              alt={cast.author.displayName || `User #${cast.author.fid}`} 
              className="author-avatar" 
            />
          )}
          <div className="author-info">
            <div className="author-name">
              {cast.author?.displayName || `User #${cast.fid || 'Unknown'}`}
            </div>
            {cast.author?.username && (
              <div className="author-username">@{cast.author.username}</div>
            )}
          </div>
        </div>
        <div className="cast-time">{formatDate(cast.timestamp)}</div>
      </div>
      
      <div className="cast-body">
        <p className="cast-text">{cast.text}</p>
        {renderEmbeds()}
      </div>
      
      <div className="cast-actions">
        <div className="cast-stat">
          <span className="icon">💬</span>
          <span className="count">{cast.counts?.replies || 0}</span>
        </div>
        <div className="cast-stat">
          <span className="icon">🔄</span>
          <span className="count">{cast.counts?.recasts || 0}</span>
        </div>
        <div className="cast-stat">
          <span className="icon">❤️</span>
          <span className="count">{cast.counts?.likes || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default CastItem;