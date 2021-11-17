import React, { Fragment, useState } from 'react';
// @ts-ignore
import styles from './position.less';
import SecondaryMenu from '@/components/secondaryMenu';
import { fundSecondaryMenuData } from '@/pages/fund/const';
import { Table, Drawer, Tag, Space, Button } from 'antd';
import TransactionSetDetail from '@/components/transactionSetDetail';

export default function() {
  const [openTransactionSetId, setOpenTransactionSetId] = useState<string|null>(null)

  const columns = [
    {
      title: '基金名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: any) => <a onClick={()=>{setOpenTransactionSetId('123')}}>{text}</a>,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      render: (tags: any) => (
        <>
          {tags.map((tag: any) => {
            let color = tag.length > 5 ? 'geekblue' : 'green';
            if (tag === 'loser') {
              color = 'volcano';
            }
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: string, record: any) => (
        <Space size="middle">
          <a>Invite {record.name}</a>
          <a>Delete</a>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
      tags: ['nice', 'developer'],
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
      tags: ['loser'],
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
      tags: ['cool', 'teacher'],
    },
  ];

  return (
    <Fragment>
      <SecondaryMenu
        data={fundSecondaryMenuData}
        calcValue={()=>(fundSecondaryMenuData.find(item => window.location.pathname.includes(item.url))?.value ?? '')}
      />
      <div style={{flexGrow: 1, height: '100%'}}>
        <div style={{marginBottom: 12}}>
          <Button type="primary">开仓新基金</Button>
        </div>
        <Table columns={columns} dataSource={data} />
      </div>
      <Drawer
        title="Basic Drawer"
        placement="right"
        onClose={()=>{setOpenTransactionSetId(null)}}
        visible={openTransactionSetId !== null}
        width={1000}
      >
        <TransactionSetDetail />
      </Drawer>
    </Fragment>
  );
}