import React, { Fragment, useState } from 'react';
// @ts-ignore
import styles from './position.less';
// @ts-ignore
import layoutStyles from '@/layouts/index.less';
import { Form, Button, Input, DatePicker, Selector } from 'antd-mobile'
import dayjs from 'dayjs'

export default function() {
  const [datePickerVisible, setDatePickerVisible] = useState(false)

  return (
    <Fragment>
      <Form
        onFinish={(values)=>{ console.log(values) }}
        footer={
          <Button block type='submit' color='primary'>
            提交
          </Button>
        }
      >
        <Form.Item
          name='fundIdentifier'
          label='基金代码'
          rules={[{ required: true }]}
        >
          <Input placeholder='请输入基金代码' />
        </Form.Item>
        <Form.Item name='direction' label='交易方向' rules={[{ required: true }]}>
          <Selector
            columns={2}
            options={[
              { label: '买入', value: 'BUY' },
              { label: '卖出', value: 'SELL' },
            ]}
          />
        </Form.Item>
        <Form.Item
          name='date'
          label='交易日期'
          onClick={() => { setDatePickerVisible(true) }}
          trigger='onConfirm'
          rules={[{ required: true }]}
        >
          <DatePicker
            visible={datePickerVisible}
            onClose={() => {setDatePickerVisible(false)}}
          >
            {value => value ? dayjs(value).format('YYYY-MM-DD') : '请选择日期'}
          </DatePicker>
        </Form.Item>
        <Form.Item name='unitPrice' label='成交价格' rules={[{ required: true }]}>
          <Input placeholder='请输入成交价格' />
        </Form.Item>
        <Form.Item name='volume' label='成交量' rules={[{ required: true }]}>
          <Input placeholder='请输入成交量' />
        </Form.Item>
        <Form.Item name='commission' label='手续费' rules={[{ required: true }]}>
          <Input placeholder='请输入手续费' />
        </Form.Item>
      </Form>
    </Fragment>
  );
}
