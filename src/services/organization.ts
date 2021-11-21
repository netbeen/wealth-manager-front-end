import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';

export interface OrganizationPermissionType {
  organization: {_id: string; name: string},
  permissions: Array<'Admin' | 'Collaborator' | 'Visitor'>
}

export const fetchCurrentOrganizationWithPermission: ()=>Promise<OrganizationPermissionType> = async () => {
  const result = (await axios.get(`${API_PREFIX}/organization/current`, {
    headers: getAuthorizationHeaders()
  })).data;
  if(result?.data?.organization?._id){
    return {
      organization: {
        _id: result.data.organization._id,
        name: result.data.organization.name,
      },
      permissions: result.data.permissions
    };
  }
  throw new Error('Organization Not Found')
};
