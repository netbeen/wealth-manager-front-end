import React, { Fragment, useMemo } from 'react';
import layoutStyles from '@/layouts/index.less';
import { Tabs } from 'antd-mobile';
import { fundSecondaryTabData } from '@/globalConst';
import { history } from '@@/core/history';
import { useRequest } from 'ahooks';
import { PositionTable } from '@/components/PositionTable';
import { fetchTransactionSetsByStatus, TransactionSetStatus } from '@/services/transactionSet';
import { AddTransactionButton } from '@/components/AddTransactionButton';

const TabPane = Tabs.TabPane;

export default function () {
  const { data: transactionSets } = useRequest(
    async () => {
      return await fetchTransactionSetsByStatus(TransactionSetStatus.Active);
    },
    { refreshDeps: [] },
  );

  const mainContent = useMemo(
    () => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <AddTransactionButton />
        {Array.isArray(transactionSets) && <PositionTable transactionSets={transactionSets} />}
      </div>
    ),
    [transactionSets],
  );

  return (
    <Fragment>
      <Tabs
        className={layoutStyles.mainContentTab}
        onChange={(key) => {
          history.push(fundSecondaryTabData.find((item) => item.value === key)?.url ?? '');
        }}
        activeKey={'position'}
      >
        {fundSecondaryTabData.map((item) => (
          <TabPane title={item.label} key={item.value}>
            {item.value === 'position' ? mainContent : <div />}
          </TabPane>
        ))}
      </Tabs>
    </Fragment>
  );
}
