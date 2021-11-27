import React, { Fragment, useMemo, useState } from 'react';
// @ts-ignore
import styles from '../position.less';
// @ts-ignore
import layoutStyles from '@/layouts/index.less';
import { Toast, Form, Button, Input, DatePicker, Selector, NavBar } from 'antd-mobile'
import dayjs, { Dayjs } from 'dayjs';
import { useRequest, useDebounce } from 'ahooks'
import { history } from 'umi'
import { fetchBasicInfo, fetchUnitPriceByIdentifier } from '@/services/fund';
import { insertTransaction, TRANSACTION_DIRECTION } from '@/services/transaction';
import { Chart, Geom, Axis, Tooltip, Legend, Coord } from 'bizcharts';

// 数据源
const data = [
  { genre: 'Sports', sold: 275, income: 2300 },
  { genre: 'Strategy', sold: 115, income: 667 },
  { genre: 'Action', sold: 120, income: 982 },
  { genre: 'Shooter', sold: 350, income: 5271 },
  { genre: 'Other', sold: 150, income: 3710 }
];

// 定义度量
const cols = {
  sold: { alias: '销售量' },
  genre: { alias: '游戏种类' }
};

export default function({match: {params: {transactionSetId}}}: {match: {params: {transactionSetId: string}}}) {
  console.log('transactionSetId', transactionSetId);
  return (
    <Fragment>
      <NavBar onBack={()=>{history.goBack()}}>{transactionSetId}</NavBar>
      <div>
        <div>123</div>
        <Chart forceFit width={400} height={400} data={data} scale={cols}>
          <Axis name="genre" title/>
          <Axis name="sold" title/>
          <Legend position="top" dy={-20} />
          <Tooltip />
          <Geom type="interval" position="genre*sold" color="genre" />
        </Chart>
      </div>
    </Fragment>
  );
}
