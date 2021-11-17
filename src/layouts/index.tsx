import React from 'react';
// @ts-ignore
import styles from './index.less';
// @ts-ignore
import logoSrc from '@/assets/logo.svg'
import useLoginStatusChecker from '@/hooks/useLoginStatusChecker';

export default function(props: any) {
  useLoginStatusChecker();

  const noTabBar = window.location.pathname === '/login'

  return (
    <div className={styles.globalLayout}>
      {
        noTabBar ? (
          props.children
        ) : (
          <div className={styles.mainContent}>
            {props.children}
          </div>
        )
      }
    </div>
  );
};
