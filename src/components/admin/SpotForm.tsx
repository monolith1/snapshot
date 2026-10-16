import { useRef, useState, type ReactNode } from 'react';
import type { Photo, Spot, SpotInput } from '../../types';
import { repo, StorageQuotaError } from '../../data';
import CoordinatePicker from './CoordinatePicker';
import { ChevronLeft, ChevronRight, PlusIcon, TrashIcon, XIcon } from '../icons';

interface Props {
  spot: Spot | null; // null = new spot
  onSaved: (spot: Spot) => void;
  onCancel: () => void;
}

type Draft = Omit<SpotInput, 'lat' | 'lng'> & { lat: string; lng: string };

const toDraft = (s: Spot | null): Draft => ({
  name: s?.name ?? '',
  neighbourhood: s?.neighbourhood ?? '',
  description: s?.description ?? '',
  tags: s?.tags ?? [],
  lat: s ? String(s.lat) : '',
  lng: s ? String(s.lng) : '',
  photos: s?.photos ?? [],
  bestTime: s?.bestTime ?? { timeOfDay: '', season: '', tip: '' },
});

export default function SpotForm({ spot, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(spot));
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const setBest = (key: keyof Draft['bestTime'], value: string) =>
    setDraft((d) => ({ ...d, bestTime: { ...d.bestTime, [key]: value } }));

  // ---- tags ----
  const addTags = (raw: string) => {
    const next = raw
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(Boolean);
    if (next.length === 0) return;
    setDraft((d) => ({ ...d, tags: [...new Set([...d.tags, ...next])] }));
    setTagInput('');
  };

  // ---- photos ----
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const list = [...files];
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const photo = await repo.uploadPhoto(file);
        setDraft((d) => ({ ...d, photos: [...d.photos, photo] }));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileRef.current) fileRef.current.value = '';
  };
  const movePhoto = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      const photos = [...d.photos];
      const j = i + dir;
      if (j < 0 || j >= photos.length) return d;
      [photos[i], photos[j]] = [photos[j], photos[i]];
      return { ...d, photos };
    });
  const removePhoto = (id: string) =>
    setDraft((d) => ({ ...d, photos: d.photos.filter((p) => p.id !== id) }));
  const setCaption = (id: string, caption: string) =>
    setDraft((d) => ({
      ...d,
      photos: d.photos.map((p) => (p.id === id ? { ...p, caption } : p)),
    }));

  // ---- save ----
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const lat = parseFloat(draft.lat);
    const lng = parseFloat(draft.lng);
    if (!draft.name.trim()) return setError('Name is required.');
    if (Number.isNaN(lat) || Number.isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
      return setError('Valid coordinates are required — click the map to set them.');

    // pick up a half-typed tag
    const pendingTags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const input: SpotInput = {
      ...draft,
      name: draft.name.trim(),
      neighbourhood: draft.neighbourhood?.trim() || undefined,
      description: draft.description.trim(),
      tags: [...new Set([...draft.tags, ...pendingTags])],
      lat,
      lng,
    };

    setSaving(true);
    try {
      const saved = spot ? await repo.update(spot.id, input) : await repo.create(input);
      // Clean up storage for photos that were removed.
      const kept = new Set(input.photos.map((p) => p.id));
      const removed: Photo[] = (spot?.photos ?? []).filter((p) => !kept.has(p.id));
      await Promise.all(removed.map((p) => repo.deletePhoto(p)));
      onSaved(saved);
    } catch (err) {
      setError(
        err instanceof StorageQuotaError
          ? err.message
          : `Could not save: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const latNum = parseFloat(draft.lat);
  const lngNum = parseFloat(draft.lng);

  return (
    <form onSubmit={save} className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-4xl">{spot ? 'Edit spot' : 'New spot'}</h2>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-2 text-mute hover:bg-white/5 hover:text-paper"
          aria-label="Cancel"
        >
          <XIcon />
        </button>
      </div>

      <Section title="Basics">
        <Field label="Name *">
          <input
            className={inputCls}
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Graffiti Alley"
            required
          />
        </Field>
        <Field label="Neighbourhood">
          <input
            className={inputCls}
            value={draft.neighbourhood}
            onChange={(e) => set('neighbourhood', e.target.value)}
            placeholder="e.g. Queen West"
          />
        </Field>
        <Field label="Description">
          <textarea
            className={`${inputCls} min-h-28 resize-y leading-relaxed`}
            value={draft.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What makes this spot worth shooting?"
          />
        </Field>
        <Field label="Tags" hint="Press Enter or comma to add">
          <div className={`${inputCls} flex flex-wrap items-center gap-1.5 py-2`}>
            {draft.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-white/10 py-0.5 pl-2.5 pr-1 text-xs"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => set('tags', draft.tags.filter((x) => x !== t))}
                  className="rounded-full p-0.5 hover:bg-white/20"
                  aria-label={`Remove ${t}`}
                >
                  <XIcon width={12} height={12} />
                </button>
              </span>
            ))}
            <input
              className="min-w-24 flex-1 bg-transparent py-1 outline-none placeholder:text-mute/60"
              value={tagInput}
              onChange={(e) => {
                const v = e.target.value;
                if (v.includes(',')) addTags(v);
                else setTagInput(v);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTags(tagInput);
                } else if (e.key === 'Backspace' && !tagInput && draft.tags.length) {
                  set('tags', draft.tags.slice(0, -1));
                }
              }}
              onBlur={() => addTags(tagInput)}
              placeholder={draft.tags.length ? '' : 'neon, reflections, people…'}
            />
          </div>
        </Field>
      </Section>

      <Section title="Best time to shoot">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Time of day">
            <input
              className={inputCls}
              value={draft.bestTime.timeOfDay}
              onChange={(e) => setBest('timeOfDay', e.target.value)}
              placeholder="e.g. Golden hour, 5–7pm"
            />
          </Field>
          <Field label="Season">
            <input
              className={inputCls}
              value={draft.bestTime.season}
              onChange={(e) => setBest('season', e.target.value)}
              placeholder="e.g. Autumn"
            />
          </Field>
        </div>
        <Field label="One-line tip">
          <input
            className={inputCls}
            value={draft.bestTime.tip}
            onChange={(e) => setBest('tip', e.target.value)}
            placeholder="e.g. 5pm in autumn for low sun"
          />
        </Field>
      </Section>

      <Section title="Location">
        <CoordinatePicker
          lat={Number.isNaN(latNum) ? null : latNum}
          lng={Number.isNaN(lngNum) ? null : lngNum}
          onChange={(la, ln) => setDraft((d) => ({ ...d, lat: String(la), lng: String(ln) }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude *">
            <input
              className={inputCls}
              inputMode="decimal"
              value={draft.lat}
              onChange={(e) => set('lat', e.target.value)}
              placeholder="43.6532"
            />
          </Field>
          <Field label="Longitude *">
            <input
              className={inputCls}
              inputMode="decimal"
              value={draft.lng}
              onChange={(e) => set('lng', e.target.value)}
              placeholder="-79.3832"
            />
          </Field>
        </div>
      </Section>

      <Section title={`Photos (${draft.photos.length})`} hint="First photo is the cover.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {draft.photos.map((p, i) => (
            <div key={p.id} className="group overflow-hidden rounded-lg border border-white/10 bg-ink-3">
              <div className="relative aspect-[4/3]">
                <img src={p.url} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink">
                    Cover
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/80 to-transparent p-1.5">
                  <div className="flex gap-1">
                    <IconBtn label="Move left" onClick={() => movePhoto(i, -1)} disabled={i === 0}>
                      <ChevronLeft width={14} height={14} />
                    </IconBtn>
                    <IconBtn
                      label="Move right"
                      onClick={() => movePhoto(i, 1)}
                      disabled={i === draft.photos.length - 1}
                    >
                      <ChevronRight width={14} height={14} />
                    </IconBtn>
                  </div>
                  <IconBtn label="Remove photo" onClick={() => removePhoto(p.id)} danger>
                    <TrashIcon width={14} height={14} />
                  </IconBtn>
                </div>
              </div>
              <input
                className="w-full bg-transparent px-2.5 py-2 text-xs outline-none placeholder:text-mute/60"
                value={p.caption ?? ''}
                onChange={(e) => setCaption(p.id, e.target.value)}
                placeholder="Caption (optional)"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/20 text-sm text-mute transition hover:border-white/50 hover:text-paper"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFiles(e.dataTransfer.files);
            }}
          >
            <PlusIcon />
            {uploading > 0 ? `Processing ${uploading}…` : 'Upload photos'}
            <span className="text-[11px] text-mute/60">or drop files here</span>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => onFiles(e.target.files)}
        />
      </Section>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-5 flex justify-end gap-2 border-t border-white/10 bg-ink/90 px-5 py-4 backdrop-blur md:-mx-8 md:px-8">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm hover:border-white/40"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || uploading > 0}
          className="rounded-full bg-paper px-6 py-2.5 text-sm font-medium text-ink transition hover:bg-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : spot ? 'Save changes' : 'Create spot'}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  'w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-paper outline-none transition placeholder:text-mute/60 focus:border-paper/40 focus:bg-white/[0.05]';

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between border-b border-white/10 pb-2">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">{title}</h3>
        {hint && <span className="text-xs text-mute">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-xs text-mute">
        {label}
        {hint && <span className="text-mute/60">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded-md bg-black/60 p-1.5 text-paper backdrop-blur transition disabled:opacity-30 ${
        danger ? 'hover:bg-red-500/80' : 'hover:bg-white/20'
      }`}
    >
      {children}
    </button>
  );
}
