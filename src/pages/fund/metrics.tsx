import React, { Fragment, useMemo } from 'react';
// @ts-ignore
import styles from './metrics.less';
import { fundSecondaryTabData } from '@/pages/fund/const';
// @ts-ignore
import layoutStyles from '@/layouts/index.less';
import { history } from '@@/core/history';
import { Tabs } from 'antd-mobile';

// @ts-ignore
const TabPane = Tabs.TabPane;

export default function() {
  const mainContent = useMemo(()=>('123'), [])

  return (
    <Fragment>
      <Tabs
        className={layoutStyles.mainContentTab}
        onChange={(key)=>{history.push(fundSecondaryTabData.find(item => item.value === key)?.url ?? '')}}
        activeKey={'metrics'}
      >
        {fundSecondaryTabData.map(item => (
          <TabPane title={item.label} key={item.value}>
            {item.value === 'metrics' && mainContent}
          </TabPane>
        ))}
      </Tabs>
    </Fragment>
  );
}
