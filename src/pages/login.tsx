import React, {Fragment} from 'react';
// @ts-ignore
import styles from './login.less';
import axios from 'axios';
import {Input, Form, Button, Toast } from 'antd-mobile';
import sha1 from 'sha1';
import { API_PREFIX, ORGANIZATION_COOKIE_NAME, TOKEN_COOKIE_NAME, VISITOR_USER_IDENTIFIER } from '@/globalConst';
import cookies from 'js-cookie';
import { history } from 'umi';
import { getAuthorizationHeaders } from '@/utils';

export default function() {
  return (
    <div className={styles.loginPage}>
      <Form
        onFinish={async (values)=>{
          const loginResult = await axios.post(`${API_PREFIX}/user/login`, {
            username: values.username,
            passwordHash: sha1(values.password),
          }, {
            headers: getAuthorizationHeaders(),
          });
          if(!loginResult?.data?.code || loginResult?.data?.code !== 200){
            Toast.show({
              icon: 'fail',
              content: '用户名或密码错误',
            })
            return;
          }
          cookies.set(TOKEN_COOKIE_NAME, loginResult.data.data.token, { expires: 6 })

          const availableOrganizationsResult = await axios.get(`${API_PREFIX}/organization/getAvailableOrganizations`, {
            headers: getAuthorizationHeaders(),
          });
          cookies.set(ORGANIZATION_COOKIE_NAME, availableOrganizationsResult.data.data[0]._id, { expires: 6 })
          history.push('/fund/position'); // 首页一期不会建设，先跳转到基金持仓
        }}
        className={styles.loginForm}
        footer={(
          <Fragment>
            <Button block type='submit' color='primary' size="large">
              登录
            </Button>
            <Button block type='submit' size="large" >
              注册
            </Button>
            <Button block size="large" onClick={()=>{
              history.push('/');
            }}>
              访客身份登录
            </Button>
          </Fragment>
        )}
      >
        <Form.Item name='username' label='邮箱'>
          <Input placeholder='请输入登录邮箱' clearable />
        </Form.Item>
        <Form.Item name='password' label='密码'>
          <Input placeholder='请输入密码' clearable type='password' />
        </Form.Item>
      </Form>
    </div>
  );
}
