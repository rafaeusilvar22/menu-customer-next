'use client';

import { useQuery } from '@tanstack/react-query';
import { slugApi } from '@/lib/api';
import { applyTheme } from '@/lib/theme';
import { useEffect } from 'react';
import type { Workspace, WorkspaceCustomization } from '@/types/workspace';

interface EstablishmentData {
  workspace: Workspace;
  customizations: WorkspaceCustomization[];
  businessHours: unknown[];
}

const fetchEstablishment = (slug: string): Promise<EstablishmentData> =>
  slugApi(slug).getEstablishment() as Promise<EstablishmentData>;

export function useEstablishment(slug: string) {
  // Unified endpoint: workspace + customizations + businessHours
  const establishment = useQuery<EstablishmentData, Error, Workspace>({
    queryKey: ['establishment', slug],
    queryFn: () => fetchEstablishment(slug),
    select: (data) => data.workspace,
    staleTime: 5 * 60 * 1000,
  });

  // Dedicated customization endpoint for white-label brand colors
  const customization = useQuery<WorkspaceCustomization, Error, WorkspaceCustomization>({
    queryKey: ['customization', slug],
    queryFn: () => slugApi(slug).getCustomization(),
    staleTime: 5 * 60 * 1000,
  });

  // Apply brand colors as soon as they arrive
  useEffect(() => {
    if (customization.data) {
      applyTheme(customization.data);
    }
  }, [customization.data]);

  return { establishment, customization };
}
