import axios from 'axios';
import { API_PREFIX } from '@/globalConst';
import dayjs, { Dayjs } from 'dayjs';

export interface FundBasicInfoType {identifier: string, name: string, type: string}
export interface FundPriceType {date: Dayjs, price: number}
export interface FundDividendType {date: Dayjs, dividend: number}
export interface FundSpitType {date: Dayjs, splitRatio: number}

/**
 * 获取基金基本信息
 * @param identifier
 */
export const fetchBasicInfo: (identifier: string)=>Promise<FundBasicInfoType> = async (identifier) => {
  const result = (await axios.get(`${API_PREFIX}/fund/basicInfo`, {
    params:{
      identifier,
    }})).data;
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
  const result = (await axios.get(`${API_PREFIX}/fund/unitPrice`, {
    params:{
      identifier,
    }})).data;
  if(result.data.length > 0){
    return result.data.map((item: any)=>({
      date: dayjs(item.date),
      price: item.price,
    }));
  }
  throw new Error('Not Found')
};

export const fetchBasicInfoUnitPriceSplitDividendByIdentifier: (identifiers: Array<string>)=>Promise<{
  basicInfos: Array<FundBasicInfoType>,
  unitPrices: Array<Array<FundPriceType>>,
  dividends: Array<Array<FundDividendType>>,
  splits: Array<Array<FundSpitType>>,
}> = async (identifier) => {
  const result = await axios.get(`${API_PREFIX}/fund/basicInfoUnitPriceSplitDividend/batchQuery`, {
    params:{
      identifiersString: identifier.join(','),
    }});
  if(Array.isArray(result.data.data.basicInfos)){
    return {
      basicInfos: result.data.data.basicInfos,
      unitPrices: result.data.data.unitPrices.map((unitPrice: Array<{date: string}>) => {
        return unitPrice.map(item => ({...item, date: dayjs(item.date)}))
      }),
      dividends: result.data.data.dividends.map((unitPrice: Array<{date: string}>) => {
        return unitPrice.map(item => ({...item, date: dayjs(item.date)}))
      }),
      splits: result.data.data.splits.map((unitPrice: Array<{date: string}>) => {
        return unitPrice.map(item => ({...item, date: dayjs(item.date)}))
      }),
    };
  }
  throw new Error('Not Found')
};
