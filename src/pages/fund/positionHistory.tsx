import { PositionTable } from '@/components/PositionTable';
import { fundSecondaryTabData } from '@/globalConst';
import layoutStyles from '@/layouts/index.less';
import { fetchTransactionSetsByStatus, TransactionSetStatus } from '@/services/transactionSet';
import { history } from '@@/core/history';
import { useRequest } from 'ahooks';
import { Tabs } from 'antd-mobile';
import { Fragment, useMemo } from 'react';

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
