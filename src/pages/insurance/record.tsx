import React, { Fragment, useState } from 'react';
import { Selector, Toast, Form, Button, Input, DatePicker, NavBar } from 'antd-mobile'
import dayjs, { Dayjs } from 'dayjs';
import { history } from 'umi'
import { TRANSACTION_DIRECTION } from '@/services/transaction';
import { insertWealthHistoryRecord } from '@/services/wealthHistory';
import { sendTestEmail } from '@/services/insurance';

export default function() {
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [date, setDate] = useState<Dayjs>(dayjs().hour(0).minute(0).second(0))

  return (
    <Fragment>
      <NavBar onBack={()=>{history.goBack()}}>保险记录</NavBar>
      <Form
        initialValues={{
          direction: [TRANSACTION_DIRECTION.BUY],
          date: date.toDate(),
        }}
        onFinish={async (values)=>{
          const recordDetail: { [key: string]: number } = {};
          setSubmitLoading(true);
          const result = await insertWealthHistoryRecord(date, recordDetail)
          if(result._id){
            Toast.show({
              icon: 'success',
              content: '添加成功',
            })
            setSubmitLoading(false);
          }
        }}
        footer={
          <Fragment>
            <Button block type='submit' color='primary' loading={submitLoading}>
              提交
            </Button>
            <Button
              block color='primary' fill='outline' style={{marginTop: '0.25rem'}}
              onClick={()=>{
                sendTestEmail().then((res)=>{console.log(res)});
              }}
            >
              发送「续保提醒」测试邮件
            </Button>
          </Fragment>
        }
      >
        <Form.Item name='category' label='类型'>
          <Selector
            defaultValue={[TRANSACTION_DIRECTION.BUY]}
            columns={5}
            options={[
              { label: '意外', value: TRANSACTION_DIRECTION.BUY },
              { label: '医疗', value: '1' },
              { label: '重疾', value: '2' },
              { label: '人寿', value: '3' },
              { label: '年金', value: '4' },
            ]}
          />
        </Form.Item>
        <Form.Item
          name={'name'}
          label={'名称'}
          rules={[{ required: true }]}
        >
          <Input placeholder='请输入保险名称'/>
        </Form.Item>
        <Form.Item
          name={'name'}
          label={'被保险人'}
          rules={[{ required: true }]}
        >
          <Input placeholder='请输入被保险人'/>
        </Form.Item>
        <Form.Item
          name={'name'}
          label={'保额'}
          rules={[{ required: true }]}
        >
          <Input placeholder='请输入保额'/>
        </Form.Item>
        <Form.Item
          name='firstPaymentDate'
          label='首次缴费日期'
          onClick={() => { setDatePickerVisible(true) }}
          trigger='onConfirm'
        >
          <DatePicker
            value={date.toDate()}
            visible={datePickerVisible}
            onClose={() => {setDatePickerVisible(false)}}
            onConfirm={(input)=>{setDate(dayjs(input))}}
            max={dayjs().toDate()}
          >
            {() => date.format('YYYY-MM-DD')}
          </DatePicker>
        </Form.Item>
        <Form.Item name='plan' label='缴费计划'>
          <Selector
            defaultValue={[TRANSACTION_DIRECTION.BUY]}
            columns={3}
            options={[
              { label: '一次性', value: TRANSACTION_DIRECTION.BUY },
              { label: '月缴', value: '1' },
              { label: '年缴', value: '2' },
            ]}
          />
        </Form.Item>
        <Form.Item
          name={'contractUrl'}
          label={'合同URL'}
        >
          <Input placeholder='请输入保险合同URL(选填)'/>
        </Form.Item>
      </Form>
    </Fragment>
  );
}
