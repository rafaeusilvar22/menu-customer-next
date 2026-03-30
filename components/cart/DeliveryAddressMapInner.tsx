'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LocationResult } from './DeliveryAddressMap';

// Fix Leaflet default icon broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
});

interface Props {
  workspaceLat: number;
  workspaceLon: number;
  onLocationChange: (result: LocationResult) => void;
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'pt-BR' } }
    );
    const data = await res.json();
    const road = data.address?.road ?? data.address?.pedestrian ?? data.address?.path ?? '';
    const suburb = data.address?.suburb ?? data.address?.neighbourhood ?? data.address?.city_district ?? '';
    return [road, suburb].filter(Boolean).join(', ');
  } catch {
    return '';
  }
}

function MapClickHandler({ onMove }: { onMove: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapFlyTo({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { animate: true, duration: 1 });
  }, [position, map]);
  return null;
}

export default function DeliveryAddressMapInner({ workspaceLat, workspaceLon, onLocationChange }: Props) {
  const [position, setPosition] = useState<[number, number]>([workspaceLat, workspaceLon]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const markerRef = useRef<L.Marker | null>(null);

  const handlePositionChange = useCallback(async (lat: number, lon: number) => {
    setPosition([lat, lon]);
    const street = await reverseGeocode(lat, lon);
    onLocationChange({ latitude: lat, longitude: lon, street });
  }, [onLocationChange]);

  const handleGps = useCallback(async () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGpsLoading(false);
        await handlePositionChange(pos.coords.latitude, pos.coords.longitude);
      },
      () => setGpsLoading(false),
      { timeout: 10000 }
    );
  }, [handlePositionChange]);

  return (
    <div className="relative">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: 220, borderRadius: 16, zIndex: 0 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMove={handlePositionChange} />
        <MapFlyTo position={position} />
        <Marker
          position={position}
          draggable
          ref={markerRef}
          eventHandlers={{
            dragend() {
              const m = markerRef.current;
              if (!m) return;
              const { lat, lng } = m.getLatLng();
              handlePositionChange(lat, lng);
            },
          }}
        />
      </MapContainer>

      {/* GPS button overlay */}
      <button
        type="button"
        onClick={handleGps}
        disabled={gpsLoading}
        className="absolute bottom-3 right-3 z-[999] flex items-center gap-1.5 bg-white border border-gray-200 shadow-md rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all duration-150 disabled:opacity-50"
      >
        {gpsLoading ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="10" r="3" />
            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
          </svg>
        )}
        Minha localização
      </button>

      <p className="text-xs text-gray-400 mt-1.5 text-center">
        Toque no mapa ou arraste o alfinete para marcar o local exato
      </p>
    </div>
  );
}
