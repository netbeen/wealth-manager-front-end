import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';

export interface UserType {_id: string, username: string}

export const fetchMe: ()=>Promise<UserType> = async () => {
  const result = (await axios.get(`${API_PREFIX}/user/me`, {
    headers: getAuthorizationHeaders()
  })).data;
  if(result?.data?._id){
    return {
      _id: result.data._id,
      username: result.data.username,
    };
  }
  throw new Error('Login User Not Found')
};
