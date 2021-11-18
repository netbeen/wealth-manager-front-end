import React, { useEffect } from 'react';
// @ts-ignore
import styles from './index.less';
import { history } from '@@/core/history';

export default function() {
  useEffect(()=>{history.push('/fund/position')}, [])
  return (
    <div className={styles.normal}>
      123
    </div>
  );
}
