import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';

export interface TransactionSetType {_id: string, username: string}

export const fetchActiveTransactionSets: (
)=>Promise<TransactionSetType> = async () => {
  const result = (await axios.get(`${API_PREFIX}/fund/transactionSet/active`, {
    headers: getAuthorizationHeaders()
  })).data;
  return result
};
