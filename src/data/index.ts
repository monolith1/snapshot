import { LocalStorageSpotRepository } from './localStorageRepository';
import type { SpotRepository } from './repository';

/**
 * The active data source. To move to Supabase (v2):
 *   export const repo: SpotRepository = new SupabaseSpotRepository(supabase);
 */
export const repo: SpotRepository = new LocalStorageSpotRepository();

export type { SpotRepository } from './repository';
export { StorageQuotaError } from './repository';
