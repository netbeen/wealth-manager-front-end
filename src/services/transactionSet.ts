import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';

export interface TransactionSetType {_id: string, target: string, status: string}

export enum TransactionSetStatus {
  Active = 'active',
  Archived = 'archived'
}

export const fetchActiveTransactionSets: (
  status: TransactionSetStatus
)=>Promise<TransactionSetType> = async (status) => {
  const result = (await axios.get(`${API_PREFIX}/fund/transactionSet`, {
    headers: getAuthorizationHeaders(),
    params: {
      status
    }
  })).data;
  return result
};

export const fetchTransactionSetById: (
  id: string
)=>Promise<TransactionSetType|null> = async (id) => {
  const result = (await axios.get(`${API_PREFIX}/fund/getTransactionSetById`, {
    headers: getAuthorizationHeaders(),
    params: {
      id
    }
  })).data.data;
  return result ?? null
};
