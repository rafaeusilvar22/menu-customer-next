'use client';

import { useState, useCallback } from 'react';

interface GeolocationResult {
  latitude: number;
  longitude: number;
  address: string;
}

export function useGeolocation() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const geocodeAddress = useCallback(async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    if (!address.trim()) return null;
    setGeocodeStatus('loading');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=br`,
        { headers: { 'Accept-Language': 'pt-BR' } }
      );
      const data = await res.json();
      if (!data || data.length === 0) {
        setGeocodeStatus('error');
        return null;
      }
      const { lat, lon } = data[0];
      setGeocodeStatus('success');
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } catch {
      setGeocodeStatus('error');
      return null;
    }
  }, []);

  const getLocation = useCallback(async (): Promise<GeolocationResult | null> => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada pelo navegador.');
      setStatus('error');
      return null;
    }

    setStatus('loading');
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'Accept-Language': 'pt-BR' } }
            );
            const data = await res.json();
            const address = data.display_name ?? `${latitude}, ${longitude}`;
            setStatus('success');
            resolve({ latitude, longitude, address });
          } catch {
            setStatus('success');
            resolve({ latitude, longitude, address: '' });
          }
        },
        (err) => {
          const msg =
            err.code === 1
              ? 'Permissão negada. Habilite a localização no navegador.'
              : 'Não foi possível obter sua localização.';
          setError(msg);
          setStatus('error');
          resolve(null);
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  return { getLocation, status, error, geocodeAddress, geocodeStatus };
}
