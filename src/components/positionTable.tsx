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

const columns = [
  {
    code: 'name',
    name: '基金名称',
    width: 150,
    render: (value: any, record: any) => (
      <div style={{cursor: 'pointer'}} onClick={()=>{
        history.push(`/fund/transactionSet/${record.transactionSet}`)
      }}>
        {value}
      </div>
    )
  },
  { code: 'positionValue', name: '市值', width: 100, align: 'right' },
  {
    code: 'positionRateOfReturn',
    name: <div><div>收益率%</div><div>年化收益率%</div></div>,
    width: 100,
    align: 'right',
    render: (_value: any, record: any) => (
      <div>
        <div>{record.positionRateOfReturn}</div>
        <div>{record.totalAnnualizedRateOfReturn}</div>
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
      const rowData = {
        name: `${fundBasicInfoList[index]?.name ?? '基金名称获取中...'} [${transactionSet.target}]`,
        positionValue: 'Loading...',
        positionRateOfReturn: 'Loading...',
        totalAnnualizedRateOfReturn: 'Loading...',
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
      rowData.positionValue = (Math.round(positionValue*100)/100).toFixed(2);
      rowData.positionRateOfReturn = `${(Math.round(positionRateOfReturn*10000)/100).toFixed(2)}%`;
      rowData.totalAnnualizedRateOfReturn = `${(Math.round(totalAnnualizedRateOfReturn*10000)/100).toFixed(2)}%`;
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
