import { API_PREFIX } from '@/globalConst';
import { TransactionSetType } from '@/services/transactionSet';
import { getAuthorizationHeaders } from '@/utils';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

export interface TransactionType {
  _id: string;
  date: Dayjs;
  direction: TRANSACTION_DIRECTION;
  volume: number;
  commission: number;
  transactionSet: string;
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
) => Promise<TransactionType> = async (target, volume, commission, date, direction) => {
  if (/^\d{6}$/.test(target) && volume > 0 && commission > 0 && !!direction && !!date) {
    return (
      await axios.post(
        `${API_PREFIX}/fund/transaction`,
        {
          target,
          volume,
          commission,
          date: date.format(),
          direction,
        },
        {
          headers: getAuthorizationHeaders(),
        },
      )
    ).data;
  } else {
    throw new Error('insertTransaction failed: Invalid Params');
  }
};

// export const fetchTransaction: (transactionSet: string) => Promise<Array<TransactionType>> = async (
//   transactionSet,
// ) => {
//   return (
//     await axios.get(`${API_PREFIX}/fund/transaction`, {
//       headers: getAuthorizationHeaders(),
//       params: {
//         transactionSet,
//       },
//     })
//   ).data;
// };

export const batchFetchTransaction: (
  transactionSets: Array<TransactionSetType>,
) => Promise<Array<Array<TransactionType>>> = async (transactionSets) => {
  const result: Array<Array<TransactionType>> = (
    await axios.get(`${API_PREFIX}/fund/transaction/batchQuery`, {
      headers: getAuthorizationHeaders(),
      params: {
        transactionSetsString: transactionSets.map((item) => item._id).join(','),
      },
    })
  ).data.data;
  return result.map((item) => item.map((item2) => ({ ...item2, date: dayjs(item2.date) })));
};
