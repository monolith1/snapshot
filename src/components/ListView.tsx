import type { Spot } from '../types';
import { CameraIcon, SunIcon } from './icons';

interface Props {
  spots: Spot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Scrollable editorial grid — alternative to the map. */
export default function ListView({ spots, selectedId, onSelect }: Props) {
  return (
    <div className="no-scrollbar absolute inset-0 overflow-y-auto bg-ink">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-40 md:px-8 md:pt-36">
        {spots.length === 0 ? (
          <p className="py-24 text-center text-mute">No spots match these tags.</p>
        ) : (
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {spots.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onSelect(s.id)}
                  className={`group block w-full text-left ${selectedId === s.id ? 'opacity-100' : ''}`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-ink-3">
                    {s.photos[0] ? (
                      <img
                        src={s.photos[0].url}
                        alt={s.photos[0].caption || s.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-mute">
                        <CameraIcon width={32} height={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <span className="absolute left-4 top-4 font-display text-lg text-paper/70 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s.photos.length > 1 && (
                      <span className="absolute right-4 top-4 rounded-full bg-black/50 px-2 py-0.5 text-[11px] text-paper/80 backdrop-blur">
                        {s.photos.length} photos
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-paper/60">
                        {s.neighbourhood}
                      </p>
                      <h3 className="font-display text-3xl leading-tight text-paper">{s.name}</h3>
                    </div>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-paper/70">
                    <SunIcon width={14} height={14} className="text-accent" />
                    {s.bestTime.timeOfDay}
                    {s.bestTime.season && <span className="text-mute">· {s.bestTime.season}</span>}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-mute">
                    {s.description}
                  </p>
                  <p className="mt-2 text-xs text-paper/50">{s.tags.map((t) => `#${t}`).join('  ')}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
