import { useState } from 'react';
import { useSite } from '../../context/ProfileContext';

/** Profile photo with a gradient initials fallback when the image is missing. */
export default function Avatar({ className = '' }) {
  const site = useSite();
  const [failedSrc, setFailedSrc] = useState('');
  const failed = failedSrc === site.photo;

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-brand-500 to-purple-600 text-6xl font-bold text-white ${className}`}
        role="img"
        aria-label={site.name}
      >
        {site.initials}
      </div>
    );
  }

  return (
    <img
      src={site.photo}
      alt={`Portrait of ${site.name}`}
      onError={() => setFailedSrc(site.photo)}
      className={`object-cover ${className}`}
      loading="lazy"
    />
  );
}
