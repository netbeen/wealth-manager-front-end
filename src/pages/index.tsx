import React from 'react';
// @ts-ignore
import styles from './index.less';

export default function() {
  return (
    <div className={styles.normal}>
      123
      <ul className={styles.list}>
        <li>To get started, edit <code>src/pages/index.js</code> and save to reload.</li>
        <li>
          <a href="https://umijs.org/guide/getting-started.html">
            Getting Started
          </a>
        </li>
      </ul>
    </div>
  );
}
