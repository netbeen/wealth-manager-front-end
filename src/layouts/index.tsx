import React, { Fragment } from 'react';
// @ts-ignore
import styles from './index.less';
// @ts-ignore
import logoSrc from '@/assets/logo.svg'
import useLoginStatusChecker from '@/hooks/useLoginStatusChecker';
import { TabBar } from 'antd-mobile'
import axios from 'axios'
import {
  UnorderedListOutline,
  UserOutline,
} from 'antd-mobile-icons'
import {history} from 'umi';

axios.interceptors.response.use((response) => response, (error) => {
  if (typeof error.response === 'undefined') {
    alert('A network error occurred. This could be a CORS issue or a dropped internet connection. It is not possible for us to know.')
  }
  return Promise.reject(error)
})

const tabs = [
  // {
  //   key: 'home',
  //   title: '首页',
  //   icon: <AppOutline />,
  //   badge: Badge.dot,
  // },
  {
    key: 'fund',
    title: '基金',
    url: '/fund/position',
    icon: <UnorderedListOutline />,
  },
  // {
  //   key: 'message',
  //   title: '我的消息',
  //   icon: (active: boolean) =>
  //     active ? <MessageFill /> : <MessageOutline />,
  // },
  {
    key: 'me',
    title: '个人中心',
    url: '/me',
    icon: <UserOutline />,
  },
]

export default function(props: any) {
  useLoginStatusChecker();

  const noLayout = window.location.pathname === '/login'

  return (
    <div className={styles.globalLayout}>
      {
        noLayout ? (
          props.children
        ) : (
          <Fragment>
            <div className={styles.mainContent}>
              {props.children}
            </div>
            <TabBar
              activeKey={tabs.find(item => window.location.pathname.includes(item.key))?.key ?? ''}
              onChange={(selectedKey)=>{
                console.log(selectedKey);
                history.push(tabs.find(item => item.key === selectedKey)?.url ?? '')
              }}
            >
              {tabs.map(item => (
                <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
              ))}
            </TabBar>
          </Fragment>
        )
      }
    </div>
  );
};
