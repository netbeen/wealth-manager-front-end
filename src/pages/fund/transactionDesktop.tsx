import React, { Fragment, useMemo, useState } from 'react';
import { message, Form, Input, Button, Radio, DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useRequest, useDebounce } from 'ahooks'
import { history } from 'umi'
import { fetchBasicInfo, fetchUnitPriceByIdentifier } from '@/services/fund';
import { insertTransaction, TRANSACTION_DIRECTION } from '@/services/transaction';

export default function() {
  const [fundIdentifier, setFundIdentifier] = useState<string>('')
  const [date, setDate] = useState<Dayjs>(dayjs().hour(0).minute(0).second(0))

  const debouncedIdentifier = useDebounce(fundIdentifier, { wait: 500 })

  const { data: fundBasicInfo, error: fundBasicInfoError } = useRequest(async () => {
    if(debouncedIdentifier.length === 0){
      return;
    }
    return await fetchBasicInfo(debouncedIdentifier)
  }, {
    refreshDeps: [debouncedIdentifier],
  });

  const { data: fundUnitPriceList } = useRequest(async () => {
    if(debouncedIdentifier.length === 0){
      return;
    }
    return await fetchUnitPriceByIdentifier(debouncedIdentifier)
  }, {
    refreshDeps: [debouncedIdentifier],
  });

  const {unitPrice, unitPriceErrorMessage}: {unitPrice: number|null, unitPriceErrorMessage: string} = useMemo(()=>{
    if(!fundUnitPriceList || fundUnitPriceList.length === 0 || !date){
      return {
        unitPrice: null,
        unitPriceErrorMessage: '选择交易日期后自动获取'
      };
    }
    const targetUnitPriceObject = fundUnitPriceList.find(item => item.date.isSame(date))
    if(!targetUnitPriceObject){
      return {
        unitPrice: null,
        unitPriceErrorMessage: '当前选择的交易日无数据，请重新选择'
      };
    }
    return {
      unitPrice: targetUnitPriceObject.price,
      unitPriceErrorMessage: ''
    }
  }, [fundUnitPriceList, date])

  const onFinish = async (values: any) => {
    console.log('Success:', values);
    if(
      typeof Number(values.commission) !== 'number' ||
      typeof Number(values.volume) !== 'number' ||
      typeof date?.format() !== 'string' ||
      ![TRANSACTION_DIRECTION.BUY, TRANSACTION_DIRECTION.SELL].includes(values.direction) ||
      !/^\d{6}$/.test(values.fundIdentifier) ||
      typeof unitPrice !== 'number'
    ){
      message.error('表单字段格式错误，请检查各输入项');
      return;
    }
    const result = await insertTransaction(
      values.fundIdentifier,
      Number(values.volume),
      Number(values.commission),
      date,
      values.direction
    );
    if(result._id){
      message.success('添加成功');
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Fragment>
      <Form
        name="basic"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        initialValues={{ direction: TRANSACTION_DIRECTION.BUY }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="基金代码"
          name="fundIdentifier"
          rules={[{ required: true }]}
        >
          <Input onChange={(e)=>{ setFundIdentifier(e.target.value ?? '')}}/>
        </Form.Item>
        <Form.Item
          label="基金名称"
          name="fundName"
        >
          <div>{fundBasicInfo?.name ?? (fundBasicInfoError ? '基金代码错误' : '输入基金代码后自动获取')}</div>
        </Form.Item>
        <Form.Item
          label="交易方向"
          name="direction"
        >
          <Radio.Group>
            <Radio.Button value={TRANSACTION_DIRECTION.BUY}>买入</Radio.Button>
            <Radio.Button value={TRANSACTION_DIRECTION.SELL}>卖出</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="date"
          label="交易日期"
          rules={[{ type: 'object' as const, required: true, message: 'Please select time!' }]}
        >
          <DatePicker onChange={(e)=>{
            if(e) {
              setDate(dayjs(e.valueOf()).hour(0).minute(0).second(0).millisecond(0));
            }
          }} />
        </Form.Item>
        <Form.Item
          label="成交价格"
          name="unitPrice"
        >
          <div>{unitPrice ?? unitPriceErrorMessage}</div>
        </Form.Item>
        <Form.Item
          label="成交量"
          name="volume"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="手续费"
          name="commission"
        >
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    </Fragment>
  );
}
