import { useLoginStatusChecker } from '@/hooks/useLoginStatusChecker';
import { toastFail } from '@/utils';
import { TabBar } from 'antd-mobile';
import {
  CheckShieldOutline,
  PayCircleOutline,
  UnorderedListOutline,
  UserOutline,
} from 'antd-mobile-icons';
import axios from 'axios';
import { Fragment } from 'react';
import { Outlet, history, useLocation } from 'umi';
import styles from './index.less';

axios.interceptors.response.use(
  (response) => {
    if (response?.data?.code === 401) {
      toastFail('登录超时，你需要重新登录');
      history.push('/login');
    }
    return response;
  },
  (error) => {
    if (typeof error.response === 'undefined') {
      alert(
        'A network error occurred. This could be a CORS issue or a dropped internet connection. It is not possible for us to know.',
      );
    }
    return Promise.reject(error);
  },
);

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
    url: '/insurance/list',
    icon: <CheckShieldOutline />,
  },
  {
    key: 'me',
    title: '个人中心',
    url: '/me',
    icon: <UserOutline />,
  },
];

export default function () {
  useLoginStatusChecker();
  const location = useLocation();

  const noLayout = ['/login', '/register', '/fund/transactionDesktop'].includes(location.pathname);

  return (
    <div className={styles.globalLayout}>
      {noLayout ? (
        <Outlet />
      ) : (
        <Fragment>
          <div className={styles.mainContent}>
            <Outlet />
          </div>
          <TabBar
            activeKey={tabs.find((item) => location.pathname.includes(item.key))?.key ?? ''}
            onChange={(selectedKey) => {
              history.push(tabs.find((item) => item.key === selectedKey)?.url ?? '');
            }}
          >
            {tabs.map((item) => (
              <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
            ))}
          </TabBar>
        </Fragment>
      )}
    </div>
  );
}
