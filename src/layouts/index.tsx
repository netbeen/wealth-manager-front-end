import React, { useMemo, useEffect } from 'react';
// @ts-ignore
import styles from './index.less';
// @ts-ignore
import logoSrc from '@/assets/logo.svg'
import { UserOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Tabs } from 'antd';
import useLoginStatusChecker from '@/hooks/useLoginStatusChecker';

export default function(props: any) {
  useLoginStatusChecker();

  const topbar = useMemo(()=>(
    <div className={styles.topbar}>
      <div className={styles.logo}>
        <img src={logoSrc} alt="logo" />
        <span>WealthManager</span>
      </div>
      <div style={{flexGrow: 1}} />
      <Tabs className={styles.functionSwitchTab} size="large">
        <Tabs.TabPane tab="总览" key="overview" />
        <Tabs.TabPane tab="基金" key="fund" />
      </Tabs>
      <Dropdown
        overlay={(
          <Menu style={{ width: 200 }}>
            <Menu.Item>
              切换账本
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item danger>
              切换用户
            </Menu.Item>
          </Menu>
        )}
        placement="bottomCenter"
      >
        <Button size="large" shape="circle" icon={<UserOutlined />}/>
      </Dropdown>
    </div>
  ),[]);

  return (
    <div className={styles.globalLayout}>
      {topbar}
      <div className={styles.mainContent}>
        {props.children}
      </div>
    </div>
  );
};
