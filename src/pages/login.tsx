import { ORGANIZATION_COOKIE_NAME, TOKEN_COOKIE_NAME } from '@/globalConst';
import { fetchAvailableOrganizations } from '@/services/organization';
import { login } from '@/services/user';
import { useRequest } from 'ahooks';
import { Button, Form, Input, Toast } from 'antd-mobile';
import cookies from 'js-cookie';
import { Fragment, useCallback } from 'react';
import sha1 from 'sha1';
import { history } from 'umi';
import styles from './login.less';

export default function () {
  const { loading, runAsync: runAsyncLogin } = useRequest(
    (username, passwordHash) => login(username, passwordHash),
    {
      manual: true,
    },
  );

  const doLogin = useCallback(async (username: string, passwordHash: string) => {
    try {
      const token = await runAsyncLogin(username, passwordHash);
      cookies.set(TOKEN_COOKIE_NAME, token, { expires: 6 });

      const availableOrganizationsResult = await fetchAvailableOrganizations();
      cookies.set(ORGANIZATION_COOKIE_NAME, availableOrganizationsResult[0]._id, { expires: 6 });
      await caches.delete('wm-runtime-v2');
      history.push('/');
    } catch (e) {
      Toast.show({
        icon: 'fail',
        content: '用户名或密码错误',
      });
      return;
    }
  }, []);

  return (
    <div className={styles.loginPage}>
      <img alt="logo" style={{ marginBottom: '2rem' }} width={100} src="/img/logo.svg" />
      <Form
        onFinish={(values) => {
          doLogin(values.username, sha1(values.password));
        }}
        className={styles.loginForm}
        footer={
          <Fragment>
            <Button loading={loading} block type="submit" color="primary" size="large">
              登录
            </Button>
            <Button
              block
              size="large"
              onClick={() => {
                history.push('/register');
              }}
            >
              注册
            </Button>
            <Button
              block
              size="large"
              loading={loading}
              onClick={() => {
                doLogin('访客', 'visitorHash');
              }}
            >
              访客身份登录
            </Button>
          </Fragment>
        }
      >
        <Form.Item name="username" label="邮箱">
          <Input placeholder="请输入登录邮箱" clearable />
        </Form.Item>
        <Form.Item name="password" label="密码">
          <Input placeholder="请输入密码" clearable type="password" />
        </Form.Item>
      </Form>
    </div>
  );
}
