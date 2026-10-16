import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MapView from '../components/MapView';
import ListView from '../components/ListView';
import SpotPanel, { PANEL_WIDTH } from '../components/SpotPanel';
import SpotDetail from '../components/SpotDetail';
import TagFilter from '../components/TagFilter';
import { ListIcon, MapIcon } from '../components/icons';
import { useSpots } from '../data/useSpots';
import { useIsDesktop } from '../lib/useMediaQuery';

type View = 'map' | 'list';

export default function MapPage() {
  const { spots, loading } = useSpots();
  const isDesktop = useIsDesktop();
  const [params, setParams] = useSearchParams();
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);

  // URL is the source of truth so spots are shareable: /?spot=chinatown&view=list
  const selectedId = params.get('spot');
  const view: View = params.get('view') === 'list' ? 'list' : 'map';

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === null) next.delete(k);
            else next.set(k, v);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const select = useCallback(
    (id: string) => {
      setHasInteracted(true);
      updateParams({ spot: id });
    },
    [updateParams],
  );
  const close = useCallback(() => updateParams({ spot: null }), [updateParams]);
  const setView = (v: View) => updateParams({ view: v === 'list' ? 'list' : null });

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    spots.forEach((s) => s.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [spots]);

  const visibleSpots = useMemo(() => {
    if (activeTags.length === 0) return spots;
    return spots.filter(
      (s) => s.id === selectedId || s.tags.some((t) => activeTags.includes(t)),
    );
  }, [spots, activeTags, selectedId]);

  const selected = spots.find((s) => s.id === selectedId) ?? null;
  const panelOpenDesktop = !!selected && isDesktop;

  const toggleTag = (tag: string) =>
    setActiveTags((cur) => (cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]));

  return (
    <main className="fixed inset-0 overflow-hidden bg-ink">
      {/* Map stays mounted so camera state survives list ↔ map toggles */}
      <div className={view === 'map' ? 'absolute inset-0' : 'invisible absolute inset-0'}>
        <MapView
          spots={visibleSpots}
          selectedId={selectedId}
          onSelect={select}
          onBackgroundClick={close}
          isDesktop={isDesktop}
          panelWidth={PANEL_WIDTH}
          visible={view === 'map'}
        />
      </div>

      {view === 'list' && (
        <ListView spots={visibleSpots} selectedId={selectedId} onSelect={select} />
      )}

      {/* Top chrome */}
      <header
        className="pt-safe pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-ink via-ink/75 to-transparent pb-10 transition-[padding] duration-300"
        style={{ paddingRight: panelOpenDesktop ? PANEL_WIDTH + 32 : undefined }}
      >
        <div className="pointer-events-auto flex items-start justify-between gap-4 px-4 pt-4 md:px-6 md:pt-5">
          <Link to="/" onClick={close} className="group select-none">
            <h1 className="font-display text-[2.1rem] leading-none tracking-tight text-paper md:text-[2.6rem]">
              Snap<span className="italic text-accent">S</span>hot
            </h1>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.22em] text-mute">
              Toronto · {loading ? '—' : spots.length} spots
            </p>
          </Link>

          <div
            role="tablist"
            aria-label="View"
            className="flex shrink-0 rounded-full border border-white/10 bg-ink/70 p-1 backdrop-blur-md"
          >
            {(
              [
                ['map', 'Map', MapIcon],
                ['list', 'List', ListIcon],
              ] as const
            ).map(([v, label, Icon]) => (
              <button
                key={v}
                role="tab"
                type="button"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  view === v ? 'bg-paper text-ink' : 'text-paper/70 hover:text-paper'
                }`}
              >
                <Icon width={14} height={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="pointer-events-auto mt-4 px-4 md:px-6">
          <TagFilter
            tags={tagCounts}
            active={activeTags}
            onToggle={toggleTag}
            onClear={() => setActiveTags([])}
          />
        </div>
      </header>

      {/* First-visit hint */}
      {view === 'map' && !selected && !hasInteracted && !loading && (
        <div className="pb-safe pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center">
          <p className="animate-pulse rounded-full border border-white/10 bg-ink/80 px-4 py-2 text-xs tracking-wide text-paper/80 backdrop-blur-md">
            Tap a pin to explore a spot
          </p>
        </div>
      )}

      <SpotPanel
        open={!!selected}
        isDesktop={isDesktop}
        onClose={close}
        contentKey={selected?.id}
        backdrop={view === 'list'}
      >
        {selected && (
          <SpotDetail
            spot={selected}
            onClose={close}
            onTagClick={(t) => setActiveTags([t])}
            onShowOnMap={view === 'list' ? () => setView('map') : undefined}
          />
        )}
      </SpotPanel>
    </main>
  );
}
