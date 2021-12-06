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
