import { COLOR } from '@/globalConst';
import { TRANSACTION_DIRECTION } from '@/services/transaction';
import { getAllWealthCategory, WealthCategoryType } from '@/services/wealthCategory';
import { getLatestHistoryRecord, insertWealthHistoryRecord } from '@/services/wealthHistory';
import { formatToCurrency, toastFail, toastSuccess } from '@/utils';
import { useRequest } from 'ahooks';
import { Button, DatePicker, Form, Input, NavBar, Picker } from 'antd-mobile';
import dayjs, { Dayjs } from 'dayjs';
import MobileDetect from 'mobile-detect';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { history } from 'umi';

export default function () {
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [netAssets, setNetAssets] = useState<number>(0);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [date, setDate] = useState<Dayjs>(dayjs().hour(0).minute(0).second(0));
  const [displayCategory, setDisplayCategory] = useState<Array<WealthCategoryType>>([]);
  const [categoryPickVisible, setCategoryPickVisible] = useState(false);
  const [formNumberData, setFormNumberData] = useState<{ [id: string]: number }>({});

  const mobilePhoneModel = useMemo(() => new MobileDetect(window.navigator.userAgent).mobile(), []);

  const { data: latestHistoryRecord, loading: latestHistoryRecordLoading } = useRequest(
    async () => {
      return await getLatestHistoryRecord();
    },
    {
      refreshDeps: [],
    },
  );
  console.log('latestHistoryRecord', latestHistoryRecord);

  const { data: allWealthCategory } = useRequest(
    async () => {
      return await getAllWealthCategory();
    },
    {
      refreshDeps: [],
    },
  );

  const categoryPickData = useMemo(() => {
    if (!allWealthCategory) {
      return [];
    }
    return [
      allWealthCategory
        .filter(
          (category) =>
            !displayCategory
              .map((displayCategoryItem) => displayCategoryItem._id)
              .includes(category._id),
        )
        .map((category) => category.name),
    ];
  }, [allWealthCategory, displayCategory]);

  useEffect(() => {
    if (
      !Array.isArray(allWealthCategory) ||
      allWealthCategory.length === 0 ||
      latestHistoryRecordLoading
    ) {
      return;
    }
    if (!latestHistoryRecord || Object.keys(latestHistoryRecord.detail).length === 0) {
      setDisplayCategory(allWealthCategory);
    } else {
      setDisplayCategory(
        allWealthCategory.filter(
          (wealthCategory) =>
            Object.keys(latestHistoryRecord.detail).includes(wealthCategory._id) &&
            latestHistoryRecord.detail[wealthCategory._id] > 0,
        ),
      );
    }
  }, [allWealthCategory, latestHistoryRecordLoading, latestHistoryRecord]);

  const renderDiff = (current: number, previous: number) => {
    if (current === previous) {
      return <div>环比持平</div>;
    } else if (current > previous) {
      return (
        <div style={{ color: COLOR.Profitable }}>
          环比增加
          {formatToCurrency(current - previous)} ↑
        </div>
      );
    } else {
      return (
        <div style={{ color: COLOR.LossMaking }}>
          环比减少
          {formatToCurrency(previous - current)} ↓
        </div>
      );
    }
  };

  return (
    <Fragment>
      <NavBar
        onBack={() => {
          history.back();
        }}
      >
        财富记录
      </NavBar>
      <Picker
        columns={categoryPickData}
        visible={categoryPickVisible}
        onClose={() => {
          setCategoryPickVisible(false);
        }}
        onConfirm={(categoryName) => {
          const targetCategory = allWealthCategory?.find((item) => item.name === categoryName[0]);
          if (targetCategory) {
            setDisplayCategory([...displayCategory, targetCategory]);
          }
        }}
      />
      <Form
        initialValues={{
          direction: [TRANSACTION_DIRECTION.BUY],
          date: date.toDate(),
        }}
        onFieldsChange={(field, allField) => {
          const netAssetsResult = allField.reduce((prev, cur) => {
            if (
              !Array.isArray(cur.name) ||
              typeof cur.name[0] !== 'string' ||
              ['netAssets', 'date'].includes(cur.name[0]) ||
              !cur.value
            ) {
              return prev;
            }
            const targetCategory = allWealthCategory?.find(
              (item) => item._id === cur.name[0],
            ) as WealthCategoryType;
            return prev + (targetCategory.type === 'debt' ? -Number(cur.value) : Number(cur.value));
          }, 0);
          setNetAssets(netAssetsResult);
          const numberData = {};
          allField
            .filter((item) => !['date', 'netAssets'].includes(item.name[0]))
            .forEach((item) => {
              numberData[item.name[0]] = !item.value ? NaN : Number(item.value);
            });
          setFormNumberData(numberData);
        }}
        onFinish={async (values) => {
          const recordDetail: { [key: string]: number } = {};
          for (const displayCategoryItem of displayCategory) {
            const numberValue = Number(values[displayCategoryItem._id]);
            if (isNaN(numberValue)) {
              toastFail('表单字段格式错误，请检查各输入项');
              return;
            }
            recordDetail[displayCategoryItem._id] = numberValue;
          }
          setSubmitLoading(true);
          const result = await insertWealthHistoryRecord(date, recordDetail);
          if (result._id) {
            toastSuccess('添加成功');
            setSubmitLoading(false);
            history.push('/wealth/history');
          }
        }}
        footer={
          <Fragment>
            <Button block type="submit" color="primary" loading={submitLoading}>
              提交
            </Button>
            <Button
              block
              fill="outline"
              color="primary"
              style={{ marginTop: '0.25rem' }}
              onClick={() => {
                setCategoryPickVisible(true);
              }}
            >
              增加类别
            </Button>
            {!mobilePhoneModel && (
              <Button
                block
                color="primary"
                fill="outline"
                style={{ marginTop: '0.25rem' }}
                onClick={() => {
                  history.push('/fund/transactionDesktop');
                }}
              >
                切换到桌面端页面
              </Button>
            )}
          </Fragment>
        }
      >
        <Form.Item
          name="date"
          label="记录日期"
          onClick={() => {
            setDatePickerVisible(true);
          }}
          trigger="onConfirm"
        >
          <DatePicker
            value={date.toDate()}
            visible={datePickerVisible}
            onClose={() => {
              setDatePickerVisible(false);
            }}
            onConfirm={(input) => {
              setDate(dayjs(input));
            }}
            max={dayjs().toDate()}
          >
            {() => date.format('YYYY-MM-DD')}
          </DatePicker>
        </Form.Item>
        {displayCategory.map((displayCategoryItem) => (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', right: 0, top: 39, zIndex: 1 }}>
              {!isNaN(formNumberData[displayCategoryItem._id]) &&
                !!latestHistoryRecord &&
                renderDiff(
                  formNumberData[displayCategoryItem._id],
                  latestHistoryRecord.detail[displayCategoryItem._id],
                )}
            </div>
            <Form.Item
              name={displayCategoryItem._id}
              label={displayCategoryItem.name}
              rules={[{ required: true, message: `请输入${displayCategoryItem.name}的金额` }]}
            >
              <Input placeholder="请输入该项金额，若无请填0" />
            </Form.Item>
          </div>
        ))}
        <Form.Item name="netAssets" label="净资产" disabled>
          <div>{netAssets}</div>
        </Form.Item>
      </Form>
    </Fragment>
  );
}
