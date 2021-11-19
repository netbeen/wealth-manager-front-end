import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import dayjs, { Dayjs } from 'dayjs';

export interface FundBasicInfoType {identifier: string, name: string, type: string}
export interface FundPriceType {date: Dayjs, price: number}

export const fetchBasicInfo: (identifier: string)=>Promise<FundBasicInfoType> = async (identifier) => {
  const result = await axios.get(`${API_PREFIX}/fund/basicInfo`, {
    params:{
      identifier,
    }});
  if(result?.data?.identifier){
    return {
      identifier: result.data.identifier,
      name: result.data.name,
      type: result.data.type,
    };
  }
  throw new Error('Not Found')
};


export const fetchUnitPriceByIdentifier: (identifier: string)=>Promise<Array<FundPriceType>> = async (identifier) => {
  const result = await axios.get(`${API_PREFIX}/fund/unitPrice`, {
    params:{
      identifier,
    }});
  if(result.data.length > 0){
    return result.data.map((item: any)=>({
      date: dayjs(item.date),
      price: item.price,
    }));
  }
  throw new Error('Not Found')
};
