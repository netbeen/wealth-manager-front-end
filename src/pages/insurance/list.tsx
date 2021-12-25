import React, { useMemo } from 'react';
import { Tabs, Button } from 'antd-mobile'
import { useRequest } from 'ahooks'
import { history } from 'umi'
// @ts-ignore
import layoutStyles from '@/layouts/index.less';
import { insuranceSecondaryTabData } from '@/globalConst';
import { fetchCurrentOrganizationWithPermission } from '@/services/organization';
import { fetchList, INSURANCE_TYPE, insuranceTypeName } from '@/services/insurance';
import { AntdBaseTable } from '@/components/antDesignTable';

// @ts-ignore
const TabsPane = Tabs.Pane

export default function() {
  const { data: currentOrganizationWithPermissionResult } = useRequest(async () => {
    return await fetchCurrentOrganizationWithPermission()
  }, { refreshDeps: [] });

  const { data: insuranceList, loading: insuranceListLoading } = useRequest(async () => {
    return await fetchList()
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
      {Array.isArray(insuranceList) && (
        <AntdBaseTable
          dataSource={insuranceList.map(insuranceRecord => ({
            type: insuranceTypeName[insuranceRecord.type as INSURANCE_TYPE],
            name: insuranceRecord.name,
            insured: insuranceRecord.insured,
            insuredAmount: insuranceRecord.insuredAmount,
          }))}
          columns={[
            {
              code: 'name',
              name: '名称',
              align: 'left',
              width: 140,
              render: (value: any) => (
                value
              )
            },
            {
              code: 'type',
              name: '类型',
              align: 'left',
              width: 50,
              render: (value: any) => (
                value
              )
            },
            {
              code: 'insured',
              name: '被保险人',
              align: 'left',
              width: 75,
              render: (value: any) => (
                value
              )
            },
            {
              code: 'insuredAmount',
              name: '保额',
              align: 'right',
              width: 75,
              render: (value: any) => (
                value
              )
            },
          ]}
          isStickyHeader={false}
          isLoading={insuranceListLoading}
        />
      )}
    </div>
  ),[currentOrganizationWithPermissionResult, insuranceList]);

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
