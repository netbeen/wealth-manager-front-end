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
import { calcReturn } from 'fund-tools';
import { roundWithPrecision } from '@/utils';
import { COLOR } from '@/globalConst';

const columns = [
  {
    code: 'name',
    name: '基金名称',
    width: 150,
    render: (value: any, record: any) => (
      <div style={{cursor: 'pointer'}} onClick={()=>{
        history.push(`/fund/transactionSet/${record.transactionSet}`)
      }}>
        <div>{`${record.name ?? 'Loading...'} [${record.identifier}]`}</div>
      </div>
    )
  },
  {
    code: 'positionValue',
    name: '市值',
    width: 100,
    align: 'right',
    render: (value: any, record: any) => (
      <div>{record.positionValue ? roundWithPrecision(record.positionValue, 2) : ''}</div>
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
          color: record.positionRateOfReturn > 0 ? COLOR.Profitable : COLOR.LossMaking
        }}>
          {record.positionRateOfReturn ? roundWithPrecision(record.positionRateOfReturn * 100, 2) : ''}%
        </div>
        <div style={{
          color: record.totalAnnualizedRateOfReturn > 0 ? COLOR.Profitable : COLOR.LossMaking
        }}>
          {record.totalAnnualizedRateOfReturn ? roundWithPrecision(record.totalAnnualizedRateOfReturn * 100, 2) : ''}%
        </div>
      </div>
    )
  },
]

export default function({transactionSets}: {transactionSets: TransactionSetType[]}) {
  const [fundBasicInfoList, setFundBasicInfoList] = useState<Array<FundBasicInfoType>>([])
  const [unitPricesList, setUnitPricesList] = useState<Array<Array<FundPriceType>>>([])
  const [dividendsList, setDividendsList] = useState<Array<Array<FundDividendType>>>([])
  const [splitsList, setSplitsList] = useState<Array<Array<FundSpitType>>>([])
  const [tableLoading, setTableLoading] = useState<boolean>(true)
  const [transactionsList, setTransactionsList] = useState<Array<Array<TransactionType>>>([])

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

  const tableData = useMemo(()=>{
    if(!Array.isArray(transactionSets)){
      return [];
    }
    return transactionSets.map((transactionSet, index)=>{
      const rowData: {
        identifier: string;
        name?: string;
        positionValue: null | number;
        positionRateOfReturn: null | number;
        totalAnnualizedRateOfReturn: null | number;
        transactionSet: string;
      } = {
        identifier: transactionSet.target,
        name: fundBasicInfoList[index]?.name,
        positionValue: null,
        positionRateOfReturn: null,
        totalAnnualizedRateOfReturn: null,
        transactionSet: transactionSet._id,
      };
      if(
        !Array.isArray(unitPricesList[index]) ||
        !Array.isArray(dividendsList[index]) ||
        !Array.isArray(splitsList[index]) ||
        !Array.isArray(transactionsList[index])
      ){
        return rowData;
      }
      const { positionValue, positionRateOfReturn, totalAnnualizedRateOfReturn } = calcReturn(
        unitPricesList[index],
        dividendsList[index],
        splitsList[index],
        transactionsList[index]
      );
      rowData.positionValue = positionValue;
      rowData.positionRateOfReturn = positionRateOfReturn;
      rowData.totalAnnualizedRateOfReturn = totalAnnualizedRateOfReturn;
      return rowData;
    })
  }, [transactionSets, fundBasicInfoList, unitPricesList, dividendsList, splitsList, transactionsList])

  return (
    <AntdBaseTable
      dataSource={tableData}
      columns={columns}
      isStickyHeader={false}
      isLoading={tableLoading}
    />
  );
}
