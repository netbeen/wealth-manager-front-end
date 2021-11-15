import React, { Fragment } from 'react';
// @ts-ignore
import styles from './metrics.less';
import SecondaryMenu from '@/components/secondaryMenu';
import { fundSecondaryMenuData } from '@/pages/fund/const';

export default function() {
  return (
    <Fragment>
      <SecondaryMenu
        data={fundSecondaryMenuData}
        calcValue={()=>(fundSecondaryMenuData.find(item => window.location.pathname.includes(item.url))?.value ?? '')}
      />
    </Fragment>
  );
}
