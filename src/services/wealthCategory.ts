import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';

export interface WealthCategoryType {_id: string, name: string, type: 'debt'|'assets'}

export const getAllWealthCategory: ()=>Promise<Array<WealthCategoryType>> = async () => {
  const result = (await axios.get(`${API_PREFIX}/wealthCategory/findAll`, {
    headers: getAuthorizationHeaders()
  })).data;
  if(Array.isArray(result?.data)){
    return result.data.map((item: any) => ({
      _id: item._id,
      name: item.name,
      type: item.type,
    }));
  }
  throw new Error('Not Found')
};
