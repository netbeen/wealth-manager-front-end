import React from 'react';
// @ts-ignore
import styles from './index.less';
// @ts-ignore
import logoSrc from '@/assets/logo.svg'
import { Menu } from 'antd';
import { history } from 'umi';

const SecondaryMenu: React.FC<{data: Array<{value: string; label: string; url: string;}>, calcValue:()=>string}> = ({calcValue, data}) => {
  return (
    <Menu
      style={{ width: 220, height: '100%', flexShrink: 0, flexGrow: 0 }}
      mode="inline"
      selectedKeys={[calcValue()]}
    >
      {data.map((item)=>(
        <Menu.Item
          key={item.value}
          onClick={()=>{history.push(item.url)}}
        >{item.label}</Menu.Item>
      ))}
    </Menu>
  );
};

export default SecondaryMenu;
