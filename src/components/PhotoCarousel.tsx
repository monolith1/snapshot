import { useCallback, useEffect, useRef, useState } from 'react';
import type { Photo } from '../types';
import { CameraIcon, ChevronLeft, ChevronRight, ExpandIcon } from './icons';

interface Props {
  photos: Photo[];
  alt: string;
  onOpen?: (index: number) => void;
  className?: string;
}

/** Swipeable scroll-snap carousel. Native scrolling = smooth on phones. */
export default function PhotoCarousel({ photos, alt, onOpen, className = '' }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  const go = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(photos.length - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 });
    setIndex(0);
  }, [photos]);

  if (photos.length === 0) {
    return (
      <div
        className={`flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-ink-3 text-mute ${className}`}
      >
        <CameraIcon width={28} height={28} />
        <span className="text-xs tracking-wide uppercase">Photos coming soon</span>
      </div>
    );
  }

  return (
    <div className={`group relative aspect-[4/3] overflow-hidden bg-ink-3 ${className}`}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpen?.(i)}
            className="relative h-full w-full shrink-0 snap-center cursor-zoom-in"
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
          >
            <img
              src={p.url}
              alt={p.caption || `${alt} — photo ${i + 1}`}
              className="h-full w-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </button>
        ))}
      </div>

      {/* bottom gradient + caption */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
      {photos[index]?.caption && (
        <p className="pointer-events-none absolute bottom-3 left-4 right-24 truncate text-xs text-paper/80">
          {photos[index].caption}
        </p>
      )}

      {photos.length > 1 && (
        <>
          <div className="pointer-events-none absolute bottom-3.5 right-4 flex gap-1.5">
            {photos.map((p, i) => (
              <span
                key={p.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-4 bg-paper' : 'w-1.5 bg-paper/40'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/50 p-2 text-paper opacity-0 backdrop-blur transition group-hover:opacity-100 disabled:!opacity-0 md:block"
            aria-label="Previous photo"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === photos.length - 1}
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/50 p-2 text-paper opacity-0 backdrop-blur transition group-hover:opacity-100 disabled:!opacity-0 md:block"
            aria-label="Next photo"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {onOpen && (
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-paper/80 opacity-0 backdrop-blur transition group-hover:opacity-100">
          <ExpandIcon width={14} height={14} />
        </span>
      )}
    </div>
  );
}
