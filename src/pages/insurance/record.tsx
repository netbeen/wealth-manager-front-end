import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Selector, Toast, Picker, Form, Button, Input, DatePicker, NavBar } from 'antd-mobile'
import dayjs, { Dayjs } from 'dayjs';
import { useRequest } from 'ahooks'
import { history } from 'umi'
import MobileDetect from 'mobile-detect'
import { TRANSACTION_DIRECTION } from '@/services/transaction';
import migration from '@/services/migration';
import { getAllWealthCategory, WealthCategoryType } from '@/services/wealthCategory';
import { getLatestHistoryRecord, insertWealthHistoryRecord } from '@/services/wealthHistory';

export default function() {
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [netAssets, setNetAssets] = useState<number>(0)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [date, setDate] = useState<Dayjs>(dayjs().hour(0).minute(0).second(0))
  const [displayCategory, setDisplayCategory] = useState<Array<WealthCategoryType>>([])
  const [categoryPickVisible, setCategoryPickVisible] = useState(false)

  const { data: latestHistoryRecord, loading: latestHistoryRecordLoading } = useRequest(async () => {
    return await getLatestHistoryRecord()
  }, {
    refreshDeps: [],
  });

  const { data: allWealthCategory } = useRequest(async () => {
    return await getAllWealthCategory()
  }, {
    refreshDeps: [],
  });

  const categoryPickData = useMemo(()=>{
    if(!allWealthCategory){
      return []
    }
    return [
      allWealthCategory.filter(category => !displayCategory.map(displayCategoryItem => displayCategoryItem._id).includes(category._id)).map(category => category.name)
    ];
  }, [allWealthCategory, displayCategory])

  useEffect(()=>{
    if(!Array.isArray(allWealthCategory) || allWealthCategory.length === 0 || latestHistoryRecordLoading){
      return;
    }
    if(!latestHistoryRecord || Object.keys(latestHistoryRecord.detail).length === 0){
      setDisplayCategory(allWealthCategory)
    }else{
      setDisplayCategory(allWealthCategory.filter(wealthCategory => (
        Object.keys(latestHistoryRecord.detail).includes(wealthCategory._id) && latestHistoryRecord.detail[wealthCategory._id] > 0
      )))
    }
  }, [allWealthCategory, latestHistoryRecordLoading, latestHistoryRecord])

  return (
    <Fragment>
      <NavBar onBack={()=>{history.goBack()}}>保险记录</NavBar>
      <Picker
        columns={categoryPickData}
        visible={categoryPickVisible}
        onClose={() => {
          setCategoryPickVisible(false)
        }}
        onConfirm={categoryName => {
          const targetCategory = allWealthCategory?.find(item => item.name === categoryName[0]);
          if(targetCategory){
            setDisplayCategory([...displayCategory, targetCategory]);
          }
        }}
      />
      <Form
        initialValues={{
          direction: [TRANSACTION_DIRECTION.BUY],
          date: date.toDate(),
        }}
        onFieldsChange={(field, allField)=>{
          const netAssetsResult = allField.reduce((prev, cur)=>{
            if(!Array.isArray(cur.name) || typeof cur.name[0] !== 'string' || ["netAssets", 'date'].includes(cur.name[0]) || !cur.value){
              return prev
            }
            // @ts-ignore
            const targetCategory = allWealthCategory?.find(item => item._id === cur.name[0]) as WealthCategoryType;
            return prev + (targetCategory.type === 'debt' ? -Number(cur.value) : Number(cur.value))
          }, 0);
          setNetAssets(netAssetsResult);
        }}
        onFinish={async (values)=>{
          const recordDetail: { [key: string]: number } = {};
          for(let displayCategoryItem of displayCategory) {
            const numberValue = Number(values[displayCategoryItem._id]);
            if(isNaN(numberValue)){
              Toast.show({
                icon: 'fail',
                content: '表单字段格式错误，请检查各输入项',
              })
              return;
            }
            recordDetail[displayCategoryItem._id] = numberValue;
          }
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
              // onClick={()=>{history.push('/fund/transactionDesktop')}}
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
