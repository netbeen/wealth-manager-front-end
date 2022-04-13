import React, { Fragment, useMemo } from 'react';
// @ts-ignore
import layoutStyles from '@/layouts/index.less';
import { Button, Tabs } from 'antd-mobile';
import { fundSecondaryTabData } from '@/globalConst';
import { history } from '@@/core/history';
import { useRequest } from 'ahooks';
import PositionTable from '@/components/PositionTable';
import { fetchCurrentOrganizationWithPermission } from '@/services/organization';
import { fetchTransactionSetsByStatus, TransactionSetStatus } from '@/services/transactionSet';

// @ts-ignore
const TabPane = Tabs.TabPane

export default function() {
  const { data: currentOrganizationWithPermissionResult } = useRequest(async () => {
    return await fetchCurrentOrganizationWithPermission()
  }, { refreshDeps: [] });

  const { data: transactionSets } = useRequest(async () => {
    return await fetchTransactionSetsByStatus(TransactionSetStatus.Active)
  }, { refreshDeps: [] });

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
      {Array.isArray(transactionSets) && <PositionTable transactionSets={transactionSets}/>}
    </div>
  ),[currentOrganizationWithPermissionResult, transactionSets]);

  return (
    <Fragment>
      <Tabs
        className={layoutStyles.mainContentTab}
        onChange={(key)=>{history.push(fundSecondaryTabData.find(item => item.value === key)?.url ?? '')}}
        activeKey={'position'}
      >
        {fundSecondaryTabData.map(item => (
          <TabPane title={item.label} key={item.value}>
            {item.value === 'position' ? mainContent : <div/>}
          </TabPane>
        ))}
      </Tabs>
    </Fragment>
  );
}
