import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { MAP_STYLE, TORONTO_CENTER } from '../MapView';

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

const round = (n: number) => Math.round(n * 1e5) / 1e5;

/** Click the map (or drag the pin) to set a spot's coordinates. */
export default function CoordinatePicker({ lat, lng, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!ref.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: MAP_STYLE,
      center: lat != null && lng != null ? [lng, lat] : TORONTO_CENTER,
      zoom: lat != null ? 15 : 12,
      attributionControl: { compact: true },
      dragRotate: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    const el = document.createElement('div');
    el.className = 'pick-marker';
    const marker = new maplibregl.Marker({ element: el, draggable: true });
    marker.on('dragend', () => {
      const p = marker.getLngLat();
      onChangeRef.current(round(p.lat), round(p.lng));
    });
    markerRef.current = marker;

    map.on('click', (e) => onChangeRef.current(round(e.lngLat.lat), round(e.lngLat.lng)));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // init once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
      marker.remove();
      return;
    }
    marker.setLngLat([lng, lat]).addTo(map);
    if (!map.getBounds().contains([lng, lat])) map.easeTo({ center: [lng, lat] });
  }, [lat, lng]);

  return (
    <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 md:h-64">
      <div className="absolute inset-0">
        <div ref={ref} className="h-full w-full" />
      </div>
      <p className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-ink/80 px-2 py-1 text-[11px] text-paper/70 backdrop-blur">
        Click map or drag pin to set location
      </p>
    </div>
  );
}
