import React, { Fragment, useMemo } from 'react';
import layoutStyles from '@/layouts/index.less';
import { Tabs } from 'antd-mobile';
import { fundSecondaryTabData } from '@/globalConst';
import { history } from '@@/core/history';
import { useRequest } from 'ahooks';
import { fetchTransactionSetsByStatus, TransactionSetStatus } from '@/services/transactionSet';
import { PositionTable } from '@/components/PositionTable';

const TabPane = Tabs.TabPane;

export default function () {
  const { data: transactionSets } = useRequest(
    async () => {
      return await fetchTransactionSetsByStatus(TransactionSetStatus.Archived);
    },
    { refreshDeps: [] },
  );

  const mainContent = useMemo(
    () => Array.isArray(transactionSets) && <PositionTable transactionSets={transactionSets} />,
    [transactionSets],
  );

  return (
    <Fragment>
      <Tabs
        className={layoutStyles.mainContentTab}
        onChange={(key) => {
          history.push(fundSecondaryTabData.find((item) => item.value === key)?.url ?? '');
        }}
        activeKey={'positionHistory'}
      >
        {fundSecondaryTabData.map((item) => (
          <TabPane title={item.label} key={item.value}>
            {item.value === 'positionHistory' ? mainContent : <div />}
          </TabPane>
        ))}
      </Tabs>
    </Fragment>
  );
}
