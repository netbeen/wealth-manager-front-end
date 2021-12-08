import React, { Fragment, useMemo } from 'react';
// @ts-ignore
import layoutStyles from '@/layouts/index.less';
import { Button, Tabs } from 'antd-mobile';
import { wealthSecondaryTabData } from '@/globalConst';
import { history } from '@@/core/history';
import { useRequest } from 'ahooks';
import { fetchCurrentOrganizationWithPermission } from '@/services/organization';
import { getAllHistoryRecord } from '@/services/wealthHistory';
import { getAllWealthCategory } from '@/services/wealthCategory';
import { AntdBaseTable } from '@/components/antDesignTable';

// @ts-ignore
const TabPane = Tabs.TabPane

export default function() {
  const { data: currentOrganizationWithPermissionResult } = useRequest(async () => {
    return await fetchCurrentOrganizationWithPermission()
  }, { refreshDeps: [] });

  const { data: allHistory } = useRequest(async () => {
    return await getAllHistoryRecord()
  }, { refreshDeps: [] });

  const { data: allWealthCategory } = useRequest(async () => {
    return await getAllWealthCategory()
  }, {
    refreshDeps: [],
  });

  const {tableData, columns} = useMemo(()=>{
    if(!Array.isArray(allHistory) || allHistory.length === 0 || !Array.isArray(allWealthCategory) || allWealthCategory.length === 0){
      return {
        tableData: [],
        columns: [],
      };
    }
    const existCategoryIdentifiers = new Set();
    const tableData: Array<{[key: string]: number|string}> = [];
    allHistory.forEach((historyItem)=>{
      const currentRowData: {[key: string]: number|string} = {
        date: historyItem.date.format('YYYY-MM-DD')
      };
      let sum = 0;
      Object.keys(historyItem.detail).forEach((categoryIdentifier)=>{
        const numberValue = Number(historyItem.detail[categoryIdentifier])
        if(numberValue === 0){
          return;
        }
        currentRowData[categoryIdentifier] = numberValue;
        sum += numberValue
        existCategoryIdentifiers.add(categoryIdentifier)
      })
      currentRowData.sum = sum;
      tableData.push(currentRowData)
    })
    return {
      tableData,
      columns: [
        {
          code: 'date',
          name: '记录日期',
          render: (value: any) => (
            value
          )
        },
        {
          code: 'sum',
          name: '净资产',
          render: (value: any) => (
            Intl.NumberFormat('en-US', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2
            }).format(value)
          )
        },
        ...(Array.from(existCategoryIdentifiers).map((categoryIdentifier)=> {
          const targetCategory = allWealthCategory.find(item => item._id === categoryIdentifier);
          if(targetCategory){
            return {
              code: categoryIdentifier,
              name: targetCategory.name,
              render: (value: any) => (
                Intl.NumberFormat('en-US', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                }).format(value)
              )
            }
          }
        }))
      ],
    };
  }, [allHistory, allWealthCategory])
  console.log('tableData, columns', tableData, columns);

  const mainContent = useMemo(()=>(
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <Button
        color='primary'
        style={{marginBottom: 12}}
        onClick={()=>{history.push('/wealth/record')}}
        disabled={
          Array.isArray(currentOrganizationWithPermissionResult?.permissions) &&
          !currentOrganizationWithPermissionResult?.permissions.includes('Admin') &&
          !currentOrganizationWithPermissionResult?.permissions.includes('Collaborator')
        }
      >添加记录</Button>
      <AntdBaseTable
        dataSource={tableData}
        columns={columns}
        isStickyHeader={false}
        // isLoading={tableLoading}
      />
    </div>
  ),[currentOrganizationWithPermissionResult, tableData, columns]);

  return (
    <Fragment>
      <Tabs
        className={layoutStyles.mainContentTab}
        onChange={(key)=>{history.push(wealthSecondaryTabData.find(item => item.value === key)?.url ?? '')}}
        activeKey={'history'}
      >
        {wealthSecondaryTabData.map(item => (
          <TabPane title={item.label} key={item.value}>
            {item.value === 'history' ? mainContent : <div/>}
          </TabPane>
        ))}
      </Tabs>
    </Fragment>
  );
}