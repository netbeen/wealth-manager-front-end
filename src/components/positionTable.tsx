import React, { useMemo, useState } from 'react';
import { history } from '@@/core/history';
import { useAsyncEffect } from 'ahooks';
import { AntdBaseTable } from '@/components/antDesignTable';
import { TransactionSetType } from '@/services/transactionSet';
import {
  fetchBasicInfoUnitPriceSplitDividendByIdentifier,
  FundBasicInfoType,
  FundDividendType,
  FundPriceType,
  FundSpitType,
} from '@/services/fund';
import { batchFetchTransaction, TransactionType } from '@/services/transaction';
import { calcReturn, lastOfArray, sliceBetween } from 'fund-tools';
import { COLOR } from '@/globalConst';
import { Dayjs } from 'dayjs';

export default function({transactionSets}: {transactionSets: TransactionSetType[]}) {
  const [fundBasicInfoList, setFundBasicInfoList] = useState<Array<FundBasicInfoType>>([])
  const [unitPricesList, setUnitPricesList] = useState<Array<Array<FundPriceType>>>([])
  const [dividendsList, setDividendsList] = useState<Array<Array<FundDividendType>>>([])
  const [splitsList, setSplitsList] = useState<Array<Array<FundSpitType>>>([])
  const [tableLoading, setTableLoading] = useState<boolean>(true)
  const [transactionsList, setTransactionsList] = useState<Array<Array<TransactionType>>>([])

  const transactionSetActive = !window.location.pathname.includes('History');

  useAsyncEffect(async () => {
    if(!Array.isArray(transactionSets)){
      return;
    }
    const basicInfoUnitPriceSplitDividendResult = await fetchBasicInfoUnitPriceSplitDividendByIdentifier(transactionSets.map(transactionSet => transactionSet.target))
    setFundBasicInfoList(basicInfoUnitPriceSplitDividendResult.basicInfos);
    setUnitPricesList(basicInfoUnitPriceSplitDividendResult.unitPrices);
    setDividendsList(basicInfoUnitPriceSplitDividendResult.dividends);
    setSplitsList(basicInfoUnitPriceSplitDividendResult.splits);
    const transactionResult = await batchFetchTransaction(transactionSets)
    setTransactionsList(transactionResult);
    setTableLoading(false);
  }, [transactionSets]);

  const columns = useMemo(()=>{
    if(!transactionSets[0]){
      return [];
    }
    return ([
      {
        code: 'name',
        name: <span>基金名称</span>,
        width: 150,
        align: 'left',
        render: (value: any, record: any) => (
          <div style={{cursor: 'pointer'}} onClick={()=>{
            history.push(`/fund/transactionSet/${record.transactionSet}`)
          }}>
            <div>{`${record.name ?? 'Loading...'} [${record.identifier}]`}</div>
          </div>
        )
      },
      transactionSetActive ? {
        code: 'positionValue',
        name: <span>市值</span>,
        width: 100,
        align: 'right',
        render: (value: any, record: any) => (
          <div>{record.positionValue !== null  ? Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          }).format(record.positionValue) : ''}</div>
        )
      } : {
        code: 'positionValue',
        name: <div><div>起投日期</div><div>收益额</div></div>,
        width: 100,
        align: 'right',
        render: (value: any, record: any) => (
          <div>
            <div>{record.startDate !== null  ? record.startDate.format('YYYY-MM-DD') : ''}</div>
            <div>{record.totalReturn !== null  ?
              Intl.NumberFormat('en-US', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
              }).format(record.totalReturn):
              ''
            }</div>
          </div>
        )
      },
      {
        code: 'positionRateOfReturn',
        name: <div><div>收益率%</div><div>年化收益率%</div></div>,
        width: 100,
        align: 'right',
        render: (_value: any, record: any) => (
          <div>
            <div style={{
              color: record.totalRateOfReturn > 0 ? COLOR.Profitable : COLOR.LossMaking
            }}>
              {record.totalRateOfReturn !== null ?
                Intl.NumberFormat('en-US', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                }).format(record.totalRateOfReturn * 100) : ''}%
            </div>
            <div style={{
              color: record.totalAnnualizedRateOfReturn > 0 ? COLOR.Profitable : COLOR.LossMaking
            }}>
              {record.totalAnnualizedRateOfReturn !== null ?
                Intl.NumberFormat('en-US', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                }).format(record.totalAnnualizedRateOfReturn * 100) : ''}%
            </div>
          </div>
        )
      },
    ])
  }, [transactionSets]);

  const tableData = useMemo(()=>{
    if(!Array.isArray(transactionSets)){
      return [];
    }
    return transactionSets.map((transactionSet, index)=>{
      const rowData: {
        identifier: string;
        name?: string;
        positionValue: null | number;
        totalRateOfReturn: null | number;
        totalAnnualizedRateOfReturn: null | number;
        transactionSet: string;
        totalReturn: number | null;
        startDate: Dayjs | null;
      } = {
        identifier: transactionSet.target,
        name: fundBasicInfoList[index]?.name,
        positionValue: null,
        totalRateOfReturn: null,
        totalAnnualizedRateOfReturn: null,
        transactionSet: transactionSet._id,
        totalReturn: null,
        startDate: null,
      };
      if(
        !Array.isArray(unitPricesList[index]) ||
        !Array.isArray(dividendsList[index]) ||
        !Array.isArray(splitsList[index]) ||
        !Array.isArray(transactionsList[index])
      ){
        return rowData;
      }
      const { positionValue, totalReturn, totalRateOfReturn, totalAnnualizedRateOfReturn } = calcReturn(
        sliceBetween(unitPricesList[index], transactionsList[index][0].date, lastOfArray(unitPricesList[index]).date),
        sliceBetween(dividendsList[index], transactionsList[index][0].date, lastOfArray(unitPricesList[index]).date),
        sliceBetween(splitsList[index], transactionsList[index][0].date, lastOfArray(unitPricesList[index]).date),
        sliceBetween(transactionsList[index], transactionsList[index][0].date, lastOfArray(unitPricesList[index]).date)
      );
      rowData.positionValue = positionValue;
      rowData.totalRateOfReturn = totalRateOfReturn;
      rowData.totalAnnualizedRateOfReturn = totalAnnualizedRateOfReturn;
      rowData.totalReturn = totalReturn;
      rowData.startDate = transactionsList[index][0].date
      return rowData;
    }).sort((a,b)=>{
      if(transactionSetActive && a.positionValue && b.positionValue){
        // 按照市值从高到低排序
        return b.positionValue - a.positionValue
      }else if(!transactionSetActive && a.startDate && b.startDate){
        return b.startDate.isBefore(a.startDate) ? -1 : 1
      }else{
        return 1;
      }
    });
  }, [transactionSets, fundBasicInfoList, unitPricesList, dividendsList, splitsList, transactionsList])

  // @ts-ignore
  return (<AntdBaseTable dataSource={tableData} columns={columns} isStickyHeader={false} isLoading={tableLoading} />);
}
