import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { repo } from '../data';
import { useSpots } from '../data/useSpots';
import SpotForm from '../components/admin/SpotForm';
import { ArrowLeft, CameraIcon, EditIcon, PlusIcon, TrashIcon } from '../components/icons';
import type { Spot } from '../types';

type Editing = { mode: 'new' } | { mode: 'edit'; id: string } | null;

/** Approximate localStorage usage (UTF-16 → 2 bytes/char). */
function storageBytes() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    total += (k.length + (localStorage.getItem(k)?.length ?? 0)) * 2;
  }
  return total;
}

export default function AdminPage() {
  const { spots, loading } = useSpots();
  const [editing, setEditing] = useState<Editing>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Admin — SnapShot';
    return () => {
      document.title = 'SnapShot — Toronto Street Photography Spots';
    };
  }, []);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 2400);
    return () => clearTimeout(t);
  }, [flash]);

  const usage = useMemo(() => storageBytes(), [spots]); // eslint-disable-line react-hooks/exhaustive-deps
  const usagePct = Math.min(100, (usage / (5 * 1024 * 1024)) * 100);

  const editingSpot: Spot | null =
    editing?.mode === 'edit' ? (spots.find((s) => s.id === editing.id) ?? null) : null;

  const remove = async (s: Spot) => {
    if (!confirm(`Delete “${s.name}”? This can’t be undone.`)) return;
    await repo.remove(s.id);
    if (editing?.mode === 'edit' && editing.id === s.id) setEditing(null);
    setFlash(`Deleted ${s.name}`);
  };

  const reset = async () => {
    if (!confirm('Reset all spots to the original seed data? Your edits and uploads will be lost.'))
      return;
    await repo.reset();
    setEditing(null);
    setFlash('Restored seed data');
  };

  const exportJson = async () => {
    const data = await repo.list();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `snapshot-spots-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const showForm = editing !== null;

  return (
    <div className="min-h-dvh bg-ink text-paper">
      <header className="pt-safe sticky top-0 z-20 border-b border-white/10 bg-ink/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="rounded-full p-2 text-mute transition hover:bg-white/5 hover:text-paper"
              aria-label="Back to map"
            >
              <ArrowLeft />
            </Link>
            <div>
              <h1 className="font-display text-3xl leading-none">
                Snap<span className="italic text-accent">S</span>hot{' '}
                <span className="text-mute">Admin</span>
              </h1>
              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-mute">
                Curate spots · stored locally in this browser
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditing({ mode: 'new' })}
            className="inline-flex items-center gap-1.5 rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:bg-white"
          >
            <PlusIcon width={16} height={16} /> <span className="hidden sm:inline">Add spot</span>
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:px-8 lg:grid-cols-[380px_1fr]">
        {/* Spot list */}
        <aside className={showForm ? 'hidden lg:block' : ''}>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              Spots ({spots.length})
            </h2>
          </div>
          {loading ? (
            <p className="text-mute">Loading…</p>
          ) : (
            <ul className="space-y-2">
              {spots.map((s) => {
                const active = editing?.mode === 'edit' && editing.id === s.id;
                return (
                  <li
                    key={s.id}
                    className={`flex items-center gap-3 rounded-xl border p-2 pr-3 transition ${
                      active ? 'border-paper/40 bg-white/[0.06]' : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setEditing({ mode: 'edit', id: s.id })}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-3">
                        {s.photos[0] ? (
                          <img src={s.photos[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-mute">
                            <CameraIcon width={18} height={18} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.name}</p>
                        <p className="truncate text-xs text-mute">
                          {s.photos.length} photo{s.photos.length === 1 ? '' : 's'} ·{' '}
                          {s.tags.slice(0, 3).join(', ') || 'no tags'}
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing({ mode: 'edit', id: s.id })}
                      className="rounded-md p-2 text-mute hover:bg-white/5 hover:text-paper"
                      aria-label={`Edit ${s.name}`}
                    >
                      <EditIcon width={16} height={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(s)}
                      className="rounded-md p-2 text-mute hover:bg-red-500/15 hover:text-red-300"
                      aria-label={`Delete ${s.name}`}
                    >
                      <TrashIcon width={16} height={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-8 space-y-4 rounded-xl border border-white/10 p-4 text-sm">
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-mute">
                <span>Browser storage</span>
                <span className="tabular-nums">
                  {(usage / 1024 / 1024).toFixed(2)} / ~5 MB
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${usagePct > 80 ? 'bg-red-400' : 'bg-paper/70'}`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-mute/80">
                Photos are compressed and kept in localStorage for v1. Move to Supabase Storage for
                unlimited, shareable photos.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportJson}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs hover:border-white/40"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-mute hover:border-red-400/50 hover:text-red-300"
              >
                Reset to seed data
              </button>
            </div>
          </div>
        </aside>

        {/* Editor */}
        <main className={showForm ? '' : 'hidden lg:block'}>
          {showForm && (editing.mode === 'new' || editingSpot) ? (
            <SpotForm
              key={editing.mode === 'edit' ? editing.id : 'new'}
              spot={editingSpot}
              onCancel={() => setEditing(null)}
              onSaved={(s) => {
                setEditing({ mode: 'edit', id: s.id });
                setFlash(`Saved ${s.name}`);
              }}
            />
          ) : (
            <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-10 text-center">
              <p className="font-display text-3xl text-paper/80">Select a spot to edit</p>
              <p className="mt-2 text-sm text-mute">or add a new one to the map.</p>
              <button
                type="button"
                onClick={() => setEditing({ mode: 'new' })}
                className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm hover:border-white/40"
              >
                <PlusIcon width={16} height={16} /> Add spot
              </button>
            </div>
          )}
        </main>
      </div>

      {flash && (
        <div className="pb-safe fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <p className="rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink shadow-xl">
            {flash}
          </p>
        </div>
      )}
    </div>
  );
}
