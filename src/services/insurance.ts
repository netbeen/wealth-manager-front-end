import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';

export enum INSURANCE_TYPE {
  Accident = 'Accident',
  Medical = 'Medical',
  CriticalIllness = 'CriticalIllness',
  Life = 'Life',
  Annuity = 'Annuity',
}

export const insuranceTypeName = {
  [INSURANCE_TYPE.Accident]: '意外',
  [INSURANCE_TYPE.Medical]: '医疗',
  [INSURANCE_TYPE.CriticalIllness]: '重疾',
  [INSURANCE_TYPE.Life]: '人寿',
  [INSURANCE_TYPE.Annuity]: '年金',
}

export enum INSURANCE_PAYMENT_PLAN {
  Bulk = 'Bulk',
  Monthly = 'Monthly',
  Annual = 'Annual',
}

export const sendTestEmail: ()=>Promise<boolean> = async () => {
  const result = (await axios.post(`${API_PREFIX}/insurance/sendTestEmail`, {}, {
    headers: getAuthorizationHeaders()
  })).data;
  if(result.data === true){
    return true;
  } else {
    throw new Error(result.message)
  }
};

export const fetchList: ()=>Promise<boolean> = async () => {
  const result = (await axios.get(`${API_PREFIX}/insurance/list`,{
    headers: getAuthorizationHeaders()
  })).data;
  if(Array.isArray(result?.data)){
    return result.data
  } else {
    console.error('Cannot get insurance list', result)
    return []
  }
};

