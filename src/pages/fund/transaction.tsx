import { fetchBasicInfo, fetchUnitPriceByIdentifier } from '@/services/fund';
import { TRANSACTION_DIRECTION, insertTransaction } from '@/services/transaction';
import { formatToCurrency, toastFail, toastSuccess } from '@/utils';
import useUrlState from '@ahooksjs/use-url-state';
import { useDebounce, useRequest } from 'ahooks';
import { Button, DatePicker, Form, Input, NavBar, Selector } from 'antd-mobile';
import dayjs, { Dayjs } from 'dayjs';
import MobileDetect from 'mobile-detect';
import { Fragment, useMemo, useState } from 'react';
import { history } from 'umi';

export default function () {
  const [query] = useUrlState();
  const [datePickerVisible, setDatePickerVisible] = useState<boolean>(false);
  const [fundIdentifier, setFundIdentifier] = useState<string>(query.targetFund ?? '');
  const [date, setDate] = useState<Dayjs>(dayjs().hour(0).minute(0).second(0));
  const [form] = Form.useForm();

  const mobilePhoneModel = useMemo(() => new MobileDetect(window.navigator.userAgent).mobile(), []);

  const debouncedIdentifier = useDebounce(fundIdentifier, { wait: 500 });

  const { data: fundBasicInfo, error: fundBasicInfoError } = useRequest(
    async () => {
      if (debouncedIdentifier.length === 0) {
        return;
      }
      return await fetchBasicInfo(debouncedIdentifier);
    },
    {
      refreshDeps: [debouncedIdentifier],
    },
  );

  const { data: fundUnitPriceList } = useRequest(
    async () => {
      if (debouncedIdentifier.length === 0) {
        return;
      }
      return await fetchUnitPriceByIdentifier(debouncedIdentifier);
    },
    {
      refreshDeps: [debouncedIdentifier],
    },
  );

  const {
    unitPrice,
    unitPriceErrorMessage,
  }: { unitPrice: number | null; unitPriceErrorMessage: string } = useMemo(() => {
    if (!fundUnitPriceList || fundUnitPriceList.length === 0 || !date) {
      return {
        unitPrice: null,
        unitPriceErrorMessage: '选择交易日期后自动获取',
      };
    }
    const targetUnitPriceObject = fundUnitPriceList.find((item) => item.date.isSame(date));
    if (!targetUnitPriceObject) {
      return {
        unitPrice: null,
        unitPriceErrorMessage: '当前选择的交易日无数据，请重新选择',
      };
    }
    return {
      unitPrice: targetUnitPriceObject.price,
      unitPriceErrorMessage: '',
    };
  }, [fundUnitPriceList, date]);

  return (
    <Fragment>
      <NavBar
        onBack={() => {
          history.back();
        }}
      >
        基金交易记录
      </NavBar>
      <Form
        form={form}
        initialValues={{
          direction: [TRANSACTION_DIRECTION.BUY],
          date: date.toDate(),
          fundIdentifier: fundIdentifier,
          totalValue: NaN,
        }}
        onValuesChange={(changedValues, { volume, commission }) => {
          if (changedValues.direction?.length === 0) {
            // Reset the direction selector
            form.setFieldValue('direction', [TRANSACTION_DIRECTION.BUY]);
          } else if (
            (changedValues.volume || changedValues.commission || changedValues.date) &&
            unitPrice
          ) {
            // Calc the total value
            form.setFieldValue(
              'totalValue',
              formatToCurrency(Number(volume) * unitPrice + Number(commission)),
            );
          }
        }}
        onFinish={async (values) => {
          if (typeof unitPrice !== 'number') {
            toastFail('当前选择的交易日无数据，请重新选择');
            return;
          }
          try {
            const result = await insertTransaction(
              values.fundIdentifier,
              Number(values.volume),
              Number(values.commission),
              date,
              values.direction[0],
            );
            if (result._id) {
              toastSuccess('添加成功');
              history.push('/fund/position');
            }
          } catch (e) {
            toastFail((e as Error).message);
          }
        }}
        footer={
          <Fragment>
            <Button block type="submit" color="primary">
              提交
            </Button>
            {!mobilePhoneModel && (
              <div className="mt-1">
                <Button
                  block
                  color="primary"
                  fill="outline"
                  onClick={() => {
                    history.push('/fund/transactionDesktop');
                  }}
                >
                  切换到桌面端页面
                </Button>
              </div>
            )}
          </Fragment>
        }
      >
        <Form.Item name="fundIdentifier" label="基金代码" rules={[{ required: true }]}>
          <Input
            placeholder="请输入六位数字基金代码"
            value={fundIdentifier}
            onChange={setFundIdentifier}
            disabled={query.targetFund}
          />
        </Form.Item>
        <Form.Item name="fundName" label="基金名称" disabled>
          <div>
            {fundBasicInfo?.name ??
              (fundBasicInfoError ? '基金代码错误' : '输入基金代码后自动获取')}
          </div>
        </Form.Item>
        <Form.Item name="direction" label="交易方向">
          <Selector
            defaultValue={[TRANSACTION_DIRECTION.BUY]}
            columns={2}
            options={[
              { label: '买入', value: TRANSACTION_DIRECTION.BUY },
              { label: '卖出', value: TRANSACTION_DIRECTION.SELL },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="date"
          label="交易日期"
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
        <Form.Item name="unitPrice" label="成交价格" disabled>
          <div>{unitPrice ?? unitPriceErrorMessage}</div>
        </Form.Item>
        <Form.Item name="volume" label="成交量" rules={[{ required: true }]}>
          <Input placeholder="请输入成交量" />
        </Form.Item>
        <Form.Item name="commission" label="手续费" rules={[{ required: true }]}>
          <Input placeholder="请输入手续费" />
        </Form.Item>
        <Form.Item name="totalValue" label="总金额" disabled>
          <Input />
        </Form.Item>
      </Form>
    </Fragment>
  );
}
