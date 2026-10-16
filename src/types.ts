/**
 * Core domain types. These map 1:1 onto the future Supabase tables:
 *   spots(id, name, neighbourhood, description, tags text[], lat, lng,
 *         best_time jsonb, created_at, updated_at)
 *   spot_photos(id, spot_id, url, caption, position)
 */

export interface Photo {
  id: string;
  /** Public URL (seed asset, data URL in localStorage mode, or Supabase Storage URL later). */
  url: string;
  caption?: string;
}

export interface BestTime {
  /** e.g. "Golden hour", "8–10am", "Blue hour" */
  timeOfDay: string;
  /** e.g. "Autumn", "Year-round" */
  season: string;
  /** One-line tip, e.g. "5pm in autumn for low sun" */
  tip: string;
}

export interface Spot {
  id: string;
  name: string;
  neighbourhood?: string;
  description: string;
  tags: string[];
  lat: number;
  lng: number;
  photos: Photo[];
  bestTime: BestTime;
  createdAt: string;
  updatedAt: string;
}

/** Fields the owner edits. id + timestamps are managed by the repository. */
export type SpotInput = Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>;
