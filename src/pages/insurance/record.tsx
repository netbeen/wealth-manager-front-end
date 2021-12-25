import React, { Fragment, useState } from 'react';
import { Selector, Toast, Form, Button, Input, DatePicker, NavBar } from 'antd-mobile'
import dayjs, { Dayjs } from 'dayjs';
import { history } from 'umi'
import { INSURANCE_PAYMENT_PLAN, INSURANCE_TYPE, insuranceTypeName, sendTestEmail } from '@/services/insurance';
import { API_PREFIX } from '@/globalConst';
import { getAuthorizationHeaders } from '@/utils';
import axios from 'axios';

export default function() {
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [firstPaymentDate, setFirstPaymentDate] = useState<Dayjs>(dayjs().hour(0).minute(0).second(0))

  return (
    <Fragment>
      <NavBar onBack={()=>{history.goBack()}}>保险记录</NavBar>
      <Form
        initialValues={{
          type: [INSURANCE_TYPE.Accident],
          paymentPlan: [INSURANCE_PAYMENT_PLAN.Bulk],
          firstPaymentDate: firstPaymentDate.toDate(),
        }}
        onFinish={async (values)=>{
          setSubmitLoading(true);
          const result = (await axios.post(`${API_PREFIX}/insurance/insert`, {
            type: values.type[0],
            name: values.name,
            insured: values.insured,
            insuredAmount: values.insuredAmount,
            firstPaymentDate: firstPaymentDate.format(),
            paymentPlan: values.paymentPlan[0],
            contractUrl: values.contractUrl,
          }, {
            headers: getAuthorizationHeaders()
          })).data;
          if(result.data._id){
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
              确定
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
        <Form.Item name='type' label='类型'>
          <Selector
            defaultValue={[INSURANCE_TYPE.Accident]}
            columns={5}
            options={[
              { label: insuranceTypeName[INSURANCE_TYPE.Accident], value: INSURANCE_TYPE.Accident },
              { label: insuranceTypeName[INSURANCE_TYPE.Medical], value: INSURANCE_TYPE.Medical },
              { label: insuranceTypeName[INSURANCE_TYPE.CriticalIllness], value: INSURANCE_TYPE.CriticalIllness },
              { label: insuranceTypeName[INSURANCE_TYPE.Life], value: INSURANCE_TYPE.Life },
              { label: insuranceTypeName[INSURANCE_TYPE.Annuity], value: INSURANCE_TYPE.Annuity },
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
          name={'insured'}
          label={'被保险人'}
          rules={[{ required: true }]}
        >
          <Input placeholder='请输入被保险人'/>
        </Form.Item>
        <Form.Item
          name={'insuredAmount'}
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
            value={firstPaymentDate.toDate()}
            visible={datePickerVisible}
            onClose={() => {setDatePickerVisible(false)}}
            onConfirm={(input)=>{setFirstPaymentDate(dayjs(input))}}
            max={dayjs().toDate()}
          >
            {() => firstPaymentDate.format('YYYY-MM-DD')}
          </DatePicker>
        </Form.Item>
        <Form.Item name='paymentPlan' label='缴费计划'>
          <Selector
            defaultValue={[INSURANCE_PAYMENT_PLAN.Bulk]}
            columns={3}
            options={[
              { label: '一次性', value: INSURANCE_PAYMENT_PLAN.Bulk },
              { label: '月缴', value: INSURANCE_PAYMENT_PLAN.Monthly },
              { label: '年缴', value: INSURANCE_PAYMENT_PLAN.Annual },
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
