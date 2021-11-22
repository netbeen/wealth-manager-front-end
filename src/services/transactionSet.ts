import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';

export interface TransactionType {_id: string, username: string}

export const fetchActiveTransactionSets: (
)=>Promise<TransactionType> = async () => {
  const result = (await axios.get(`${API_PREFIX}/fund/transactionSet/active`, {
    headers: getAuthorizationHeaders()
  })).data;
  return result
};
