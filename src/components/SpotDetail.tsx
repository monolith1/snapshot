import { useState } from 'react';
import type { Spot } from '../types';
import PhotoCarousel from './PhotoCarousel';
import Lightbox from './Lightbox';
import { BulbIcon, DirectionsIcon, LeafIcon, PinIcon, ShareIcon, SunIcon, XIcon } from './icons';

interface Props {
  spot: Spot;
  onClose: () => void;
  onShowOnMap?: () => void;
  onTagClick?: (tag: string) => void;
}

export default function SpotDetail({ spot, onClose, onShowOnMap, onTagClick }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}/?spot=${encodeURIComponent(spot.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${spot.name} — SnapShot`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      /* user cancelled */
    }
  };

  const directions = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;

  return (
    <article className="relative">
      <div className="relative">
        <PhotoCarousel photos={spot.photos} alt={spot.name} onOpen={setLightbox} />
        <button
          type="button"
          onClick={onClose}
          className="absolute left-3 top-3 rounded-full bg-black/55 p-2 text-paper backdrop-blur transition hover:bg-black/75"
          aria-label="Close"
        >
          <XIcon width={18} height={18} />
        </button>
      </div>

      <div className="px-5 pb-8 pt-5 md:px-7">
        {spot.neighbourhood && (
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-mute">
            <PinIcon width={12} height={12} />
            {spot.neighbourhood}
          </p>
        )}
        <h2 className="font-display text-[2.4rem] leading-[1.02] text-paper md:text-5xl">
          {spot.name}
        </h2>

        {spot.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {spot.tags.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => onTagClick?.(t)}
                  className="rounded-full border border-white/12 px-2.5 py-1 text-xs text-paper/80 transition hover:border-paper/50 hover:text-paper"
                >
                  #{t}
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-5 text-[15px] leading-relaxed text-paper/80">{spot.description}</p>

        {/* Best time to shoot */}
        <section className="mt-7 border-t border-white/10 pt-6">
          <h3 className="mb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
            Best time to shoot
          </h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-mute">
                <SunIcon width={14} height={14} /> Time of day
              </dt>
              <dd className="mt-1 text-[15px] text-paper">{spot.bestTime.timeOfDay || '—'}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-mute">
                <LeafIcon width={14} height={14} /> Season
              </dt>
              <dd className="mt-1 text-[15px] text-paper">{spot.bestTime.season || '—'}</dd>
            </div>
          </dl>
          {spot.bestTime.tip && (
            <p className="mt-5 flex gap-3 rounded-xl bg-white/[0.04] p-4 font-display text-xl italic leading-snug text-paper/90">
              <BulbIcon width={18} height={18} className="mt-1 shrink-0 not-italic text-accent" />
              <span>“{spot.bestTime.tip}”</span>
            </p>
          )}
        </section>

        <div className="mt-7 flex flex-wrap gap-2">
          <a
            href={directions}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-white"
          >
            <DirectionsIcon width={16} height={16} /> Directions
          </a>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-paper transition hover:border-white/40"
          >
            <ShareIcon width={16} height={16} /> {copied ? 'Link copied' : 'Share'}
          </button>
          {onShowOnMap && (
            <button
              type="button"
              onClick={onShowOnMap}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-paper transition hover:border-white/40"
            >
              <PinIcon width={16} height={16} /> Show on map
            </button>
          )}
        </div>

        <p className="mt-6 text-[11px] tabular-nums text-mute/70">
          {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
        </p>
      </div>

      {lightbox !== null && (
        <Lightbox
          photos={spot.photos}
          startIndex={lightbox}
          title={spot.name}
          onClose={() => setLightbox(null)}
        />
      )}
    </article>
  );
}
