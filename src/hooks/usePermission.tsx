import { useRequest } from 'ahooks';
import { fetchCurrentOrganizationWithPermission } from '@/services/organization';

export const usePermission: (targetPermission: string[]) => { result: boolean } = (
  targetPermission,
) => {
  const { data: currentOrganizationWithPermissionResult } = useRequest(
    async () => {
      return await fetchCurrentOrganizationWithPermission();
    },
    { refreshDeps: [] },
  );

  let result = false;
  if (
    currentOrganizationWithPermissionResult &&
    Array.isArray(currentOrganizationWithPermissionResult?.permissions) &&
    currentOrganizationWithPermissionResult.permissions.some((item) =>
      targetPermission.includes(item),
    )
  ) {
    result = true;
  }
  return { result };
};
