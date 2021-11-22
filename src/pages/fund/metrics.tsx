import React, { Fragment, useMemo } from 'react';
// @ts-ignore
import styles from './metrics.less';
import SecondaryMenu from '@/components/secondaryMenu';
import { fundSecondaryTabData } from '@/pages/fund/const';
import layoutStyles from '@/layouts/index.less';
import { history } from '@@/core/history';
import { Tabs } from 'antd-mobile';

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
          <Tabs.TabPane title={item.label} key={item.value}>
            {item.value === 'metrics' && mainContent}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </Fragment>
  );
}
