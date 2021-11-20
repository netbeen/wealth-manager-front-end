import React from 'react';
// @ts-ignore
import styles from './login.less';
import {Input, Form, Button, Toast } from 'antd-mobile';
import cookies from 'js-cookie';
import { ORGANIZATION_COOKIE_NAME, TOKEN_COOKIE_NAME } from '@/globalConst';
import { history } from 'umi';


export default function() {
  return (
    <div>
      <Button block color='danger' size='large' onClick={()=>{
        cookies.remove(TOKEN_COOKIE_NAME);
        cookies.remove(ORGANIZATION_COOKIE_NAME);
        history.push('/login')
      }}>
        退出登录状态
      </Button>
    </div>
  );
}
