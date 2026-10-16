import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Photo } from '../types';
import { ChevronLeft, ChevronRight, XIcon } from './icons';

interface Props {
  photos: Photo[];
  startIndex: number;
  title: string;
  onClose: () => void;
}

/** Full-screen photo viewer. Arrow keys / swipe to navigate, Esc to close. */
export default function Lightbox({ photos, startIndex, title, onClose }: Props) {
  const [i, setI] = useState(startIndex);
  const [touchX, setTouchX] = useState<number | null>(null);
  const prev = () => setI((n) => (n - 1 + photos.length) % photos.length);
  const next = () => setI((n) => (n + 1) % photos.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, photos.length]);

  const photo = photos[i];
  if (!photo) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
      onClick={onClose}
    >
      <div className="pt-safe flex items-center justify-between px-4 py-3 text-sm text-paper/70">
        <span className="font-display text-xl text-paper">{title}</span>
        <div className="flex items-center gap-4">
          <span className="tabular-nums">
            {i + 1} / {photos.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/10"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-16"
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX === null) return;
          const dx = e.changedTouches[0].clientX - touchX;
          if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
          setTouchX(null);
        }}
      >
        <img
          key={photo.id}
          src={photo.url}
          alt={photo.caption || title}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full object-contain"
        />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 hidden rounded-full bg-white/10 p-3 text-paper hover:bg-white/20 md:block"
              aria-label="Previous photo"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 hidden rounded-full bg-white/10 p-3 text-paper hover:bg-white/20 md:block"
              aria-label="Next photo"
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      <p className="pb-safe min-h-12 px-4 py-4 text-center text-sm text-paper/70">
        {photo.caption}
      </p>
    </div>,
    document.body,
  );
}
