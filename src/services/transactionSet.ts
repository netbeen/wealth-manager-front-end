import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';

export interface TransactionSetType {
  _id: string, target: string, status: string,
  transactionSet: string,
}

export enum TransactionSetStatus {
  Active = 'active',
  Archived = 'archived'
}

export const fetchTransactionSetsByStatus: (
  status: TransactionSetStatus
)=>Promise<TransactionSetType> = async (status) => {
  const result = (await axios.get(`${API_PREFIX}/fund/transactionSet`, {
    headers: getAuthorizationHeaders(),
    params: {
      status
    }
  })).data;

  // 兼容后端接口格式切换的逻辑，等待缓存过期后可以删除
  if(Array.isArray(result)){
    return result;
  } else {
    return result.data
  }
};

export const fetchAllTransactionSets: ()=>Promise<Array<TransactionSetType>> = async () => {
  const result = (await axios.get(`${API_PREFIX}/fund/transactionSet`, {
    headers: getAuthorizationHeaders(),
  })).data;

  return result.data
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
