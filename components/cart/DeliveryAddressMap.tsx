'use client';

import dynamic from 'next/dynamic';

export interface LocationResult {
  latitude: number;
  longitude: number;
  street: string;
}

interface Props {
  workspaceLat: number;
  workspaceLon: number;
  onLocationChange: (result: LocationResult) => void;
}

const MapInnerDynamic = dynamic(() => import('./DeliveryAddressMapInner'), { ssr: false });

export function DeliveryAddressMap(props: Props) {
  return <MapInnerDynamic {...props} />;
}
