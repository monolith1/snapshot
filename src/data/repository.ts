import type { Photo, Spot, SpotInput } from '../types';

/**
 * Storage-agnostic data access. The UI only talks to this interface, so
 * swapping localStorage → Supabase is a matter of writing a new
 * implementation (see README) and changing the export in `./index.ts`.
 */
export interface SpotRepository {
  list(): Promise<Spot[]>;
  get(id: string): Promise<Spot | null>;
  create(input: SpotInput): Promise<Spot>;
  update(id: string, patch: Partial<SpotInput>): Promise<Spot>;
  remove(id: string): Promise<void>;

  /**
   * Persist a photo file and return a Photo with a public URL.
   * localStorage: compressed data URL. Supabase: upload to Storage bucket.
   */
  uploadPhoto(file: File): Promise<Photo>;
  /** Remove the underlying stored file (no-op for data URLs). */
  deletePhoto(photo: Photo): Promise<void>;

  /** Restore seed data (dev convenience). */
  reset(): Promise<void>;

  /** Notify on any change (including from other tabs). Returns unsubscribe. */
  subscribe(listener: () => void): () => void;
}

export class StorageQuotaError extends Error {
  constructor() {
    super(
      'Browser storage is full. Remove some photos or use smaller images. (Moving to Supabase removes this limit.)',
    );
    this.name = 'StorageQuotaError';
  }
}
