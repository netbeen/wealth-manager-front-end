import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';
import { Dayjs } from 'dayjs';

export interface TransactionType {_id: string, username: string}

export const TRANSACTION_DIRECTION_BUY = 'BUY';
export const TRANSACTION_DIRECTION_SELL = 'SELL';

export const insertTransaction: (
  target: string,
  volume: number,
  commission: number,
  date: Dayjs,
  direction: string,
)=>Promise<TransactionType> = async (target, volume, commission, date, direction) => {
  const result = (await axios.post(`${API_PREFIX}/fund/transaction`, {
    target,
    volume,
    commission,
    date: date.format(),
    direction,
  }, {
    headers: getAuthorizationHeaders()
  })).data;
  return result
};

export const fetchTransaction: (
  transactionSet: string,
)=>Promise<Array<TransactionType>> = async (transactionSet) => {
  const result = (await axios.get(`${API_PREFIX}/fund/transaction`, {
    headers: getAuthorizationHeaders(),
    params:{
      transactionSet,
    },
  })).data;
  return result
};
