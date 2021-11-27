import React, { Fragment, useMemo, useState } from 'react';
// @ts-ignore
import styles from './position.less';
// @ts-ignore
import layoutStyles from '@/layouts/index.less';
import { Tabs, Button } from 'antd-mobile'
import { fundSecondaryTabData } from '@/pages/fund/const';
import { history } from '@@/core/history';
import { useRequest, useAsyncEffect } from 'ahooks';
import { AntdBaseTable } from '@/components/antDesignTable';
import { fetchCurrentOrganizationWithPermission } from '@/services/organization';
import { fetchActiveTransactionSets } from '@/services/transactionSet';
import {
  fetchBasicInfoUnitPriceSplitDividendByIdentifier,
  FundBasicInfoType,
  FundDividendType,
  FundPriceType, FundSpitType,
} from '@/services/fund';
import { batchFetchTransaction, TransactionType } from '@/services/transaction';
import { calcReturn } from 'fund-tools';

// @ts-ignore
const TabPane = Tabs.TabPane

const columns = [
  { code: 'name', name: '基金名称', width: 150, render: (value: any, record: any) => (
    <div style={{cursor: 'pointer'}} onClick={()=>{
      history.push(`/fund/transactionSet/${record.transactionSet}`)
    }}>
      {value}
    </div>) },
  { code: 'positionValue', name: '市值', width: 100, align: 'right' },
  { code: 'positionRateOfReturn', name: '收益率%', width: 80, align: 'right' },
  { code: 'totalAnnualizedRateOfReturn', name: '年化收益率%', width: 80, align: 'right' },
]

export default function() {
  const [fundBasicInfoList, setFundBasicInfoList] = useState<Array<FundBasicInfoType>>([])
  const [unitPricesList, setUnitPricesList] = useState<Array<Array<FundPriceType>>>([])
  const [dividendsList, setDividendsList] = useState<Array<Array<FundDividendType>>>([])
  const [splitsList, setSplitsList] = useState<Array<Array<FundSpitType>>>([])
  const [tableLoading, setTableLoading] = useState<boolean>(true)
  const [transactionsList, setTransactionsList] = useState<Array<Array<TransactionType>>>([])

  const { data: currentOrganizationWithPermissionResult } = useRequest(async () => {
    return await fetchCurrentOrganizationWithPermission()
  }, { refreshDeps: [] });

  const { data: transactionSets } = useRequest(async () => {
    return await fetchActiveTransactionSets('active')
  }, { refreshDeps: [] });

  useAsyncEffect(async () => {
    if(!Array.isArray(transactionSets)){
      return;
    }

  }, [transactionSets]);

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

  const mainContent = useMemo(()=>(
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <Button
        color='primary'
        style={{marginBottom: 12}}
        onClick={()=>{history.push('/fund/transaction')}}
        disabled={
          Array.isArray(currentOrganizationWithPermissionResult?.permissions) &&
          !currentOrganizationWithPermissionResult?.permissions.includes('Admin') &&
          !currentOrganizationWithPermissionResult?.permissions.includes('Collaborator')
        }
      >添加交易</Button>
      <AntdBaseTable
        dataSource={tableData}
        columns={columns}
        isStickyHeader={false}
        isLoading={tableLoading}
      />
    </div>
  ),[currentOrganizationWithPermissionResult, tableData, tableLoading]);

  return (
    <Fragment>
      <Tabs
        className={layoutStyles.mainContentTab}
        onChange={(key)=>{history.push(fundSecondaryTabData.find(item => item.value === key)?.url ?? '')}}
        activeKey={'position'}
      >
        {fundSecondaryTabData.map(item => (
          <TabPane title={item.label} key={item.value}>
            {item.value === 'position' && mainContent}
          </TabPane>
        ))}
      </Tabs>
    </Fragment>
  );
}
