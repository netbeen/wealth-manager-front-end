import React, { Fragment, useMemo, useState } from 'react';
// @ts-ignore
import styles from './position.less';
// @ts-ignore
import layoutStyles from '@/layouts/index.less';
import { Toast, Form, Button, Input, DatePicker, Selector, NavBar } from 'antd-mobile'
import dayjs, { Dayjs } from 'dayjs';
import { useRequest, useDebounce } from 'ahooks'
import { history } from 'umi'
import { fetchBasicInfo, fetchUnitPriceByIdentifier, FundBasicInfoType } from '@/services/fund';
import { insertTransaction, TRANSACTION_DIRECTION_BUY, TRANSACTION_DIRECTION_SELL } from '@/services/transaction';

export default function() {
  const [datePickerVisible, setDatePickerVisible] = useState(false)
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

  const { data: fundUnitPriceList, error: fundUnitPriceError } = useRequest(async () => {
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
    // console.log('fundUnitPriceList', fundUnitPriceList[fundUnitPriceList.length - 1].date.format(), date.format());
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

  return (
    <Fragment>
      <NavBar onBack={()=>{history.goBack()}}>基金交易记录</NavBar>
      <Form
        onFinish={async (values)=>{
          if(
            typeof Number(values.commission) !== 'number' ||
            typeof Number(values.volume) !== 'number' ||
            typeof date?.format() !== 'string' ||
            ![TRANSACTION_DIRECTION_BUY, TRANSACTION_DIRECTION_SELL].includes(values.direction[0]) ||
            !/^\d{6}$/.test(values.fundIdentifier) ||
            typeof unitPrice !== 'number'
          ){
            Toast.show({
              icon: 'fail',
              content: '表单字段格式错误，请检查各输入项',
            })
            return;
          }
          const result = await insertTransaction(
            values.fundIdentifier,
            Number(values.volume),
            Number(values.commission),
            date,
            values.direction[0]
          );
          console.log('result', result);
        }}
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
          <Input placeholder='请输入六位数字基金代码' value={fundIdentifier} onChange={setFundIdentifier} />
        </Form.Item>
        <Form.Item
          name='fundName'
          label='基金名称'
          disabled
        >
          <div>{fundBasicInfo?.name ?? (fundBasicInfoError ? '基金代码错误' : '输入基金代码后自动获取')}</div>
        </Form.Item>
        <Form.Item name='direction' label='交易方向' rules={[{ required: true }]}>
          <Selector
            columns={2}
            options={[
              { label: '买入', value: TRANSACTION_DIRECTION_BUY },
              { label: '卖出', value: TRANSACTION_DIRECTION_SELL },
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
            value={date.toDate()}
            visible={datePickerVisible}
            onClose={() => {setDatePickerVisible(false)}}
            onConfirm={(input)=>{setDate(dayjs(input))}}
          >
            {() => date.format('YYYY-MM-DD')}
          </DatePicker>
        </Form.Item>
        <Form.Item name='unitPrice' label='成交价格' disabled>
          <div>{unitPrice ?? unitPriceErrorMessage}</div>
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
