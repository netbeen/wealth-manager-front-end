import React, {Fragment} from 'react';
// @ts-ignore
import styles from './login.less';
import axios from 'axios';
import {Input, Form, Button, Toast } from 'antd-mobile';
import sha1 from 'sha1';
import { API_PREFIX, SESSION_COOKIE_NAME, VISITOR_USER_IDENTIFIER } from '@/globalConst';
import cookies from 'js-cookie';
import { history } from 'umi';

export default function() {
  return (
    <div className={styles.loginPage}>
      <Form
        onFinish={async (values)=>{
          const loginResult = await axios.get(`${API_PREFIX}/user/getByIdentifierAndPasswordHash`, {
            params:{
              username: values.username,
              passwordHash: sha1(values.password),
            }});
          if(loginResult?.data?.code === 200){
            cookies.set(SESSION_COOKIE_NAME, loginResult.data.data._id)
            history.push('/');
          }else{
            Toast.show({
              icon: 'fail',
              content: '用户名或密码错误',
            })
          }
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
              cookies.set(SESSION_COOKIE_NAME, VISITOR_USER_IDENTIFIER)
              history.push('/');
            }}>
              访客身份登录
            </Button>
          </Fragment>
        )}
      >
        <Form.Item name='username' label='用户名'>
          <Input placeholder='请输入用户名' clearable />
        </Form.Item>
        <Form.Item name='password' label='密码'>
          <Input placeholder='请输入密码' clearable type='password' />
        </Form.Item>
      </Form>
    </div>
  );
}
