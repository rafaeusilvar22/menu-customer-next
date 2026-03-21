'use client';

import { useQuery } from '@tanstack/react-query';
import { slugApi } from '@/lib/api';
import type { BusinessHours, Workspace, WorkspaceCustomization } from '@/types/workspace';

interface EstablishmentData {
  workspace: Workspace;
  customizations: WorkspaceCustomization[];
  businessHours: BusinessHours[];
}

const fetchEstablishment = (slug: string): Promise<EstablishmentData> =>
  slugApi(slug).getEstablishment() as Promise<EstablishmentData>;

export function useBusinessHours(slug: string) {
  // Reuses the same cached request from useEstablishment — no extra network call
  return useQuery<EstablishmentData, Error, BusinessHours[]>({
    queryKey: ['establishment', slug],
    queryFn: () => fetchEstablishment(slug),
    select: (data) => data.businessHours ?? [],
    staleTime: 5 * 60 * 1000,
  });
}
