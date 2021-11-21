import React from 'react';
// @ts-ignore
import styles from './login.less';
import {List, Image, Button, Toast } from 'antd-mobile';
import cookies from 'js-cookie';
import { ORGANIZATION_COOKIE_NAME, TOKEN_COOKIE_NAME } from '@/globalConst';
import { history } from 'umi';
import { useRequest } from 'ahooks';
import { fetchMe } from '@/services/user';


export default function() {
  const { data: me } = useRequest(async () => {
    return await fetchMe()
  }, {
    refreshDeps: [],
  });

  return (
    <div>
      <List>
        <List.Item
          key={me?.username ?? ''}
          prefix={
            <Image
              src={'https://images.unsplash.com/photo-1548532928-b34e3be62fc6?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&ixid=eyJhcHBfaWQiOjE3Nzg0fQ'}
              style={{ borderRadius: 20 }}
              fit='cover'
              width={40}
              height={40}
            />
          }
          description={me?.username ?? ''}
        >
          当前用户
        </List.Item>
        <List.Item>
          <Button block color='danger' size='large' onClick={()=>{
            cookies.remove(TOKEN_COOKIE_NAME);
            cookies.remove(ORGANIZATION_COOKIE_NAME);
            history.push('/login')
          }}>
            退出登录
          </Button>
        </List.Item>
      </List>
    </div>
  );
}
