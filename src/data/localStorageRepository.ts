import type { Photo, Spot, SpotInput } from '../types';
import { StorageQuotaError, type SpotRepository } from './repository';
import { SEED_SPOTS } from './seed';
import { compressImage } from '../lib/image';
import { uid } from '../lib/id';

const STORAGE_KEY = 'snapshot.spots.v1';

function seedSpots(): Spot[] {
  const now = new Date().toISOString();
  return SEED_SPOTS.map((s) => ({ ...s, createdAt: now, updatedAt: now }));
}

function isQuotaError(err: unknown) {
  return (
    err instanceof DOMException &&
    (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

export class LocalStorageSpotRepository implements SpotRepository {
  private listeners = new Set<() => void>();

  constructor() {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) this.emit();
    });
  }

  private read(): Spot[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedSpots();
      this.write(seeded, false);
      return seeded;
    }
    try {
      return JSON.parse(raw) as Spot[];
    } catch {
      console.warn('[SnapShot] Corrupt localStorage data — reseeding.');
      const seeded = seedSpots();
      this.write(seeded, false);
      return seeded;
    }
  }

  private write(spots: Spot[], notify = true) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(spots));
    } catch (err) {
      if (isQuotaError(err)) throw new StorageQuotaError();
      throw err;
    }
    if (notify) this.emit();
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  async list() {
    return this.read();
  }

  async get(id: string) {
    return this.read().find((s) => s.id === id) ?? null;
  }

  async create(input: SpotInput) {
    const now = new Date().toISOString();
    const spot: Spot = { ...input, id: uid(), createdAt: now, updatedAt: now };
    this.write([...this.read(), spot]);
    return spot;
  }

  async update(id: string, patch: Partial<SpotInput>) {
    const spots = this.read();
    const idx = spots.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Spot ${id} not found`);
    const updated: Spot = { ...spots[idx], ...patch, updatedAt: new Date().toISOString() };
    spots[idx] = updated;
    this.write(spots);
    return updated;
  }

  async remove(id: string) {
    this.write(this.read().filter((s) => s.id !== id));
  }

  async uploadPhoto(file: File): Promise<Photo> {
    // Keep photos small enough to fit several in localStorage (~5MB budget).
    const url = await compressImage(file, { maxDimension: 1600, quality: 0.78 });
    return { id: uid(), url };
  }

  async deletePhoto(_photo: Photo) {
    // Data URLs live inside the spot record — nothing else to clean up.
  }

  async reset() {
    this.write(seedSpots());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
