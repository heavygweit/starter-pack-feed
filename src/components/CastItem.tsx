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
          <div className="flex overflow-scroll scrollbar gap-2 mt-2">
            {cast.embeds.images.map((image, idx) => (
              <img
                key={`${image.url}-${idx}`}
                src={image.url}
                alt={image.title || 'Embedded image'}
                className="max-w-full max-h-[400px] rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {/* Render URL cards */}
        {cast.embeds.urls && cast.embeds.urls.length > 0 && (
          <div className="mt-2">
            {cast.embeds.urls.map((url, idx) => (
              <a
                key={`${url.url}-${idx}`}
                href={url.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden no-underline text-inherit mt-2"
              >
                {url.imageUrl && (
                  <img src={url.imageUrl} alt={url.title || 'Link preview'} className="w-[120px] h-[120px] object-cover" />
                )}
                <div className="p-3 flex-1 flex flex-col justify-center">
                  <h4 className="m-0 mb-1.5 text-sm font-semibold">{url.title || url.url}</h4>
                  {url.description && (
                    <p className="m-0 text-gray-500 text-sm overflow-hidden text-ellipsis line-clamp-2">
                      {url.description}
                    </p>
                  )}
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
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2.5">
          {cast.author?.pfpUrl && (
            <img
              src={cast.author.pfpUrl}
              alt={cast.author.displayName || `User #${cast.author.fid}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div className="flex flex-col">
            <div className="font-bold text-base">
              {cast.author?.username}
            </div>
          </div>
          <div className="text-stone-600 text-sm">{formatDate(cast.timestamp)}</div>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-3 text-base leading-relaxed whitespace-pre-wrap break-words">{cast.text}</p>
        {renderEmbeds()}
      </div>

      <div className="flex justify-between max-w-[250px]">
        <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-500 text-sm">
          {cast.counts?.replies || 0} comments
        </div>
        <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-500 text-sm">
          {cast.counts?.recasts || 0} recasts
        </div>
        <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-500 text-sm">
          {cast.counts?.likes || 0} likes
        </div>
      </div>
    </div>
  );
};

export default CastItem;