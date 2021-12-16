import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';

export const sendTestEmail: ()=>Promise<boolean> = async () => {
  const result = (await axios.post(`${API_PREFIX}/insurance/sendTestEmail`, {}, {
    headers: getAuthorizationHeaders()
  })).data;
  if(result.data === true){
    return true;
  } else {
    throw new Error(result.message)
  }
};
