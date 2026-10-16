import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import type { Spot } from '../types';

/** Free, keyless dark basemap built on OpenStreetMap data (CARTO Dark Matter). */
export const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
export const TORONTO_CENTER: [number, number] = [-79.385, 43.655];
const TORONTO_BOUNDS: maplibregl.LngLatBoundsLike = [
  [-79.75, 43.5],
  [-79.05, 43.88],
];

interface Props {
  spots: Spot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBackgroundClick: () => void;
  isDesktop: boolean;
  /** Width in px of the desktop side panel, used to offset the camera. */
  panelWidth?: number;
  visible?: boolean;
}

type MarkerEntry = { marker: maplibregl.Marker; el: HTMLDivElement; label: HTMLSpanElement };

export default function MapView({
  spots,
  selectedId,
  onSelect,
  onBackgroundClick,
  isDesktop,
  panelWidth = 440,
  visible = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef(new Map<string, MarkerEntry>());
  const fittedRef = useRef(false);
  const hasSpots = spots.length > 0;

  // Keep latest callbacks without re-binding map listeners.
  const onSelectRef = useRef(onSelect);
  const onBackgroundRef = useRef(onBackgroundClick);
  onSelectRef.current = onSelect;
  onBackgroundRef.current = onBackgroundClick;

  // --- init map once ---
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: TORONTO_CENTER,
      zoom: 12.5,
      minZoom: 10,
      maxZoom: 19,
      maxBounds: TORONTO_BOUNDS,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'bottom-right',
    );

    const container = containerRef.current;
    const updateZoomClass = () =>
      container.classList.toggle('snap-map--zoomed', map.getZoom() >= 14);
    map.on('zoom', updateZoomClass);
    updateZoomClass();

    map.on('click', (e) => {
      const target = e.originalEvent.target as HTMLElement | null;
      if (target?.closest('.snap-marker')) return;
      onBackgroundRef.current();
    });

    mapRef.current = map;
    const markers = markersRef.current;
    return () => {
      markers.forEach((m) => m.marker.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // --- sync markers with spots ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = markersRef.current;
    const ids = new Set(spots.map((s) => s.id));

    markers.forEach((entry, id) => {
      if (!ids.has(id)) {
        entry.marker.remove();
        markers.delete(id);
      }
    });

    for (const spot of spots) {
      const existing = markers.get(spot.id);
      if (existing) {
        existing.marker.setLngLat([spot.lng, spot.lat]);
        existing.label.textContent = spot.name;
        existing.el.setAttribute('aria-label', spot.name);
        continue;
      }
      const el = document.createElement('div');
      el.className = 'snap-marker';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', spot.name);
      const dot = document.createElement('span');
      dot.className = 'snap-marker__dot';
      const label = document.createElement('span');
      label.className = 'snap-marker__label';
      label.textContent = spot.name;
      el.append(dot, label);

      const id = spot.id;
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        onSelectRef.current(id);
      });
      el.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          onSelectRef.current(id);
        }
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([spot.lng, spot.lat])
        .addTo(map);
      markers.set(spot.id, { marker, el, label });
      el.classList.toggle('is-active', spot.id === selectedId);
    }

    // Frame all spots on first load (unless deep-linked to one).
    if (!fittedRef.current && spots.length > 0) {
      fittedRef.current = true;
      if (!selectedId) {
        const bounds = new maplibregl.LngLatBounds();
        spots.forEach((s) => bounds.extend([s.lng, s.lat]));
        map.fitBounds(bounds, {
          padding: { top: 140, bottom: 80, left: 50, right: 50 },
          maxZoom: 14,
          duration: 0,
        });
      }
    }
  }, [spots, selectedId]);

  // --- selection: highlight + fly ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((entry, id) => {
      entry.el.classList.toggle('is-active', id === selectedId);
    });
    if (!selectedId) return;
    const spot = spots.find((s) => s.id === selectedId);
    if (!spot) return;

    const h = map.getContainer().clientHeight;
    // Keep the pin visible beside the panel (desktop) or above the sheet (mobile).
    const offset: [number, number] = isDesktop ? [-(panelWidth + 24) / 2, 0] : [0, -h * 0.29];
    map.easeTo({
      center: [spot.lng, spot.lat],
      zoom: Math.max(map.getZoom(), 15),
      offset,
      duration: 900,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
    // Only re-run on selection change (or first data load), not on every spots edit.
  }, [selectedId, isDesktop, hasSpots]);

  // Resize after being hidden (list view → map view).
  useEffect(() => {
    if (visible) requestAnimationFrame(() => mapRef.current?.resize());
  }, [visible]);

  // NOTE: MapLibre adds `.maplibregl-map { position: relative }` (unlayered CSS), which beats
  // Tailwind v4's layered utilities — so position the wrapper, and let the map fill it.
  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" aria-label="Map of Toronto photo spots" />
    </div>
  );
}
