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

export const register: (username: string, passwordHash: string)=>Promise<UserType> = async (username, passwordHash) => {
  const result = (await axios.post(`${API_PREFIX}/user/register`, {
    username,
    passwordHash,
  }, {
    headers: getAuthorizationHeaders()
  })).data;
  if(result?.data?._id){
    return {
      _id: result.data._id,
      username: result.data.username,
    };
  }
  throw new Error('Register Failed')
};
