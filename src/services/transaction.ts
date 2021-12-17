import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';
import dayjs, { Dayjs } from 'dayjs';
import { TransactionSetType } from '@/services/transactionSet';

export interface TransactionType {
  _id: string, date: Dayjs, direction: TRANSACTION_DIRECTION, volume: number, commission: number,
  transactionSet: string
}

export enum TRANSACTION_DIRECTION {
  BUY = 'BUY',
  SELL = 'SELL',
}

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

export const batchFetchTransaction: (
  transactionSets: Array<TransactionSetType>,
)=>Promise<Array<Array<TransactionType>>> = async (transactionSets) => {
  const result: Array<Array<TransactionType>> = (await axios.get(`${API_PREFIX}/fund/transaction/batchQuery`, {
    headers: getAuthorizationHeaders(),
    params:{
      transactionSetsString: transactionSets.map(item => item._id).join(','),
    },
  })).data.data;
  return result.map(item => (item.map(item2 => ({...item2, date: dayjs(item2.date)}))))
};
