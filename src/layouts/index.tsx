import React, { Fragment } from 'react';
// @ts-ignore
import styles from './index.less';
import useLoginStatusChecker from '@/hooks/useLoginStatusChecker';
import { TabBar, Toast } from 'antd-mobile'
import axios from 'axios'
import {
  UnorderedListOutline,
  UserOutline,
  CheckShieldOutline,
  PayCircleOutline,
} from 'antd-mobile-icons'
import {history} from 'umi';

axios.interceptors.response.use(
  (response) => {
    if(response?.data?.code === 401){
      Toast.show({
        icon: 'fail',
        content: '登录超时，你需要重新登录',
      })
      history.push('/login')
    }
    return response
  },
  (error) => {
    if (typeof error.response === 'undefined') {
      alert('A network error occurred. This could be a CORS issue or a dropped internet connection. It is not possible for us to know.')
    }
    return Promise.reject(error)
  }
)

const tabs = [
  {
    key: 'wealth',
    title: '财富',
    url: '/wealth/metrics',
    icon: <PayCircleOutline />,
  },
  {
    key: 'fund',
    title: '基金',
    url: '/fund/metrics',
    icon: <UnorderedListOutline />,
  },
  {
    key: 'insurance',
    title: '保险',
    url: '/insurance',
    icon: <CheckShieldOutline/>,
  },
  {
    key: 'me',
    title: '个人中心',
    url: '/me',
    icon: <UserOutline />,
  },
]

export default function(props: any) {
  useLoginStatusChecker();

  const noLayout = ['/login', '/register', '/fund/transactionDesktop'].includes(window.location.pathname)

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
