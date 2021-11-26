import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';

export interface TransactionSetType {_id: string, username: string}

export const fetchActiveTransactionSets: (
  status: 'active' | 'Archived'
)=>Promise<TransactionSetType> = async (status) => {
  const result = (await axios.get(`${API_PREFIX}/fund/transactionSet`, {
    headers: getAuthorizationHeaders(),
    params: {
      status
    }
  })).data;
  return result
};
