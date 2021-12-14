import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Tabs, Toast, Picker, Form, Button, Input, DatePicker, NavBar } from 'antd-mobile'
import dayjs, { Dayjs } from 'dayjs';
import { useRequest } from 'ahooks'
import { history } from 'umi'
// @ts-ignore
import layoutStyles from '@/layouts/index.less';
import { insuranceSecondaryTabData } from '@/globalConst';
import { fetchCurrentOrganizationWithPermission } from '@/services/organization';

// @ts-ignore
const TabsPane = Tabs.Pane

export default function() {
  const { data: currentOrganizationWithPermissionResult } = useRequest(async () => {
    return await fetchCurrentOrganizationWithPermission()
  }, { refreshDeps: [] });

  const mainContent = useMemo(()=>(
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <Button
        color='primary'
        style={{marginBottom: 12}}
        onClick={()=>{history.push('/insurance/record')}}
        disabled={
          Array.isArray(currentOrganizationWithPermissionResult?.permissions) &&
          !currentOrganizationWithPermissionResult?.permissions.includes('Admin') &&
          !currentOrganizationWithPermissionResult?.permissions.includes('Collaborator')
        }
      >添加保险</Button>
      {/*{Array.isArray(transactionSets) && <PositionTable transactionSets={transactionSets}/>}*/}
    </div>
  ),[currentOrganizationWithPermissionResult]);

  return (
    <Tabs
      className={layoutStyles.mainContentTab}
      onChange={(key)=>{history.push(insuranceSecondaryTabData.find(item => item.value === key)?.url ?? '')}}
      activeKey={'list'}
    >
      {insuranceSecondaryTabData.map(item => (
        <TabsPane title={item.label} key={item.value}>
          {item.value === 'list' ? mainContent : <div/>}
        </TabsPane>
      ))}
    </Tabs>
  );
}
