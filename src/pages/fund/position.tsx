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
import { fetchBasicInfo, FundBasicInfoType } from '@/services/fund';
import { fetchTransaction } from '@/services/transaction';

const columns = [
  { code: 'name', name: '基金名称', width: 150 },
  { code: 'confirmed', name: '市值', width: 100, align: 'right' },
  { code: 'cured', name: '持仓收益率', width: 130, align: 'right' },
  { code: 'dead', name: '年化收益率', width: 130, align: 'right' },
]

export default function() {
  const [fundBasicInfoList, setFundBasicInfoList] = useState<Array<FundBasicInfoType>>([])

  const { data: currentOrganizationWithPermissionResult } = useRequest(async () => {
    return await fetchCurrentOrganizationWithPermission()
  }, { refreshDeps: [] });

  const { data: transactionSets } = useRequest(async () => {
    return await fetchActiveTransactionSets()
  }, { refreshDeps: [] });

  useAsyncEffect(async () => {
    if(!Array.isArray(transactionSets)){
      return;
    }
    const result = await Promise.all(transactionSets.map(transactionSet => (fetchBasicInfo(transactionSet.target))))
    setFundBasicInfoList(result);
  }, [transactionSets]);

  useAsyncEffect(async () => {
    if(!Array.isArray(transactionSets)){
      return;
    }
    const result = await Promise.all(transactionSets.map(transactionSet => (fetchTransaction(transactionSet._id))))
    console.log('result', result);
  }, [transactionSets]);

  const tableData = useMemo(()=>{
    if(!Array.isArray(transactionSets)){
      return [];
    }
    return transactionSets.map((transactionSet, index)=>{
      return {
        name: `${fundBasicInfoList[index]?.name ?? ''} [${transactionSet.target}]`,
        confirmed: 54406,
        cured: 4793,
        dead: 1457,
        t: '2020-02-15 19:52:02'
      };
    })
  }, [transactionSets, fundBasicInfoList])

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
        // stickyTop={0}
        isStickyHeader={false}
      />
    </div>
  ),[currentOrganizationWithPermissionResult, tableData]);

  return (
    <Fragment>
      <Tabs
        className={layoutStyles.mainContentTab}
        onChange={(key)=>{history.push(fundSecondaryTabData.find(item => item.value === key)?.url ?? '')}}
        activeKey={'position'}
      >
        {fundSecondaryTabData.map(item => (
          <Tabs.TabPane title={item.label} key={item.value}>
            {item.value === 'position' && mainContent}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </Fragment>
  );
}
