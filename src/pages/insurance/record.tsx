import { API_PREFIX } from '@/globalConst';
import {
  INSURANCE_PAYMENT_PLAN,
  INSURANCE_TYPE,
  InsuranceType,
  fetchById,
  insuranceTypeName,
  sendTestEmail,
} from '@/services/insurance';
import { getAuthorizationHeaders, toastSuccess } from '@/utils';
import { useAsyncEffect } from 'ahooks';
import { Button, DatePicker, Form, Input, NavBar, Selector } from 'antd-mobile';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { Fragment, useState } from 'react';
import { history, useSearchParams } from 'umi';

export default function () {
  const [searchParams] = useSearchParams({});
  const id = searchParams.get('id');

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [firstPaymentDate, setFirstPaymentDate] = useState<Dayjs>(
    dayjs().hour(0).minute(0).second(0),
  );
  const [existedInsurance, setExistedInsurance] = useState<InsuranceType | null>(null);

  useAsyncEffect(async () => {
    if (!id) {
      return;
    }
    const result = await fetchById(id);
    if (!result) {
      return;
    }
    setFirstPaymentDate(result.firstPaymentDate);
    setExistedInsurance(result);
  }, [id]);

  if (id && !existedInsurance) {
    return null;
  }
  return (
    <Fragment>
      <NavBar
        onBack={() => {
          history.back();
        }}
      >
        保险记录
      </NavBar>
      <Form
        initialValues={{
          type: [existedInsurance?.type ?? INSURANCE_TYPE.Accident],
          name: existedInsurance?.name ?? '',
          insured: existedInsurance?.insured ?? '',
          insuredAmount: existedInsurance?.insuredAmount ?? '',
          paymentPlan: [existedInsurance?.paymentPlan ?? INSURANCE_PAYMENT_PLAN.Bulk],
          firstPaymentDate: firstPaymentDate.toDate(),
          contractUrl: existedInsurance?.contractUrl ?? '',
        }}
        onFinish={async (values) => {
          setSubmitLoading(true);
          const result = (
            await axios.post(
              `${API_PREFIX}/insurance/insert`,
              {
                type: values.type[0],
                name: values.name,
                insured: values.insured,
                insuredAmount: values.insuredAmount,
                firstPaymentDate: firstPaymentDate.format(),
                paymentPlan: values.paymentPlan[0],
                contractUrl: values.contractUrl,
              },
              {
                headers: getAuthorizationHeaders(),
              },
            )
          ).data;
          if (result.data._id) {
            toastSuccess('添加成功');
            setSubmitLoading(false);
          }
        }}
        footer={
          <Fragment>
            <Button block type="submit" color="primary" loading={submitLoading}>
              确定
            </Button>
            <Button
              block
              color="primary"
              fill="outline"
              style={{ marginTop: '0.25rem' }}
              onClick={() => {
                sendTestEmail().then((res) => {
                  console.log(res);
                });
              }}
            >
              发送「续保提醒」测试邮件
            </Button>
          </Fragment>
        }
      >
        <Form.Item name="type" label="类型">
          <Selector
            defaultValue={[INSURANCE_TYPE.Accident]}
            columns={5}
            options={[
              { label: insuranceTypeName[INSURANCE_TYPE.Accident], value: INSURANCE_TYPE.Accident },
              { label: insuranceTypeName[INSURANCE_TYPE.Medical], value: INSURANCE_TYPE.Medical },
              {
                label: insuranceTypeName[INSURANCE_TYPE.CriticalIllness],
                value: INSURANCE_TYPE.CriticalIllness,
              },
              { label: insuranceTypeName[INSURANCE_TYPE.Life], value: INSURANCE_TYPE.Life },
              { label: insuranceTypeName[INSURANCE_TYPE.Annuity], value: INSURANCE_TYPE.Annuity },
            ]}
          />
        </Form.Item>
        <Form.Item name={'name'} label={'名称'} rules={[{ required: true }]}>
          <Input placeholder="请输入保险名称" />
        </Form.Item>
        <Form.Item name={'insured'} label={'被保险人'} rules={[{ required: true }]}>
          <Input placeholder="请输入被保险人" />
        </Form.Item>
        <Form.Item name={'insuredAmount'} label={'保额'} rules={[{ required: true }]}>
          <Input placeholder="请输入保额" />
        </Form.Item>
        <Form.Item
          name="firstPaymentDate"
          label="首次缴费日期"
          onClick={() => {
            setDatePickerVisible(true);
          }}
          trigger="onConfirm"
        >
          <DatePicker
            value={firstPaymentDate.toDate()}
            visible={datePickerVisible}
            onClose={() => {
              setDatePickerVisible(false);
            }}
            onConfirm={(input) => {
              setFirstPaymentDate(dayjs(input));
            }}
            max={dayjs().toDate()}
          >
            {() => firstPaymentDate.format('YYYY-MM-DD')}
          </DatePicker>
        </Form.Item>
        <Form.Item name="paymentPlan" label="缴费计划">
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
        <Form.Item name={'contractUrl'} label={'合同URL'}>
          <Input placeholder="请输入保险合同URL(选填)" />
        </Form.Item>
      </Form>
    </Fragment>
  );
}
