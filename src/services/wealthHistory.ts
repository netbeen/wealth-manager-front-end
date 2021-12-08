import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';
import { Dayjs } from 'dayjs';

export interface WealthHistoryType {_id: string, date: Dayjs, detail: { [key: string]: number }}

export const insertWealthHistoryRecord: (date: Dayjs, detail: { [key: string]: number })=>Promise<WealthHistoryType> = async (
  date, detail
) => {
  const result = (await axios.post(`${API_PREFIX}/wealthHistory/create`, {
    date: date.format(),
    detail,
  }, {
    headers: getAuthorizationHeaders()
  })).data;
  if(result.data){
    return result;
  }
  throw new Error('Not Found')
};

export const getLatestHistoryRecord: ()=>Promise<WealthHistoryType|null> = async () => {
  const result = (await axios.get(`${API_PREFIX}/wealthHistory/latestRecord`, {
    headers: getAuthorizationHeaders()
  })).data;
  if(result.data){
    return result;
  }
  throw new Error('Not Found')
};

export const getAllHistoryRecord: ()=>Promise<Array<WealthHistoryType>> = async () => {
  const result = (await axios.get(`${API_PREFIX}/wealthHistory/allRecord`, {
    headers: getAuthorizationHeaders()
  })).data;
  if(result.data){
    return result;
  }
  throw new Error('Not Found')
};
