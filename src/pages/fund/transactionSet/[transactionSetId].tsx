import React, { Fragment, useMemo, useState } from 'react';
// @ts-ignore
import styles from '../position.less';
// @ts-ignore
import layoutStyles from '@/layouts/index.less';
import { Toast, Form, Button, Input, DatePicker, Selector, NavBar } from 'antd-mobile'
import dayjs, { Dayjs } from 'dayjs';
import { useRequest } from 'ahooks'
import { history } from 'umi'
import {
  fetchBasicInfoUnitPriceSplitDividendByIdentifier,
} from '@/services/fund';
import { Chart, Geom, Axis, Tooltip, Legend, getTheme } from 'bizcharts';
import { fetchTransactionSetById, TransactionSetStatus } from '@/services/transactionSet';
import { batchFetchTransaction } from '@/services/transaction';
import { sliceBetween, lastOfArray } from 'fund-tools';

// const colors = getTheme().colors10;

export default function({match: {params: {transactionSetId}}}: {match: {params: {transactionSetId: string}}}) {
  const { data: transactionSet } = useRequest(async () => {
    return await fetchTransactionSetById(transactionSetId)
  }, { refreshDeps: [] });

  // 获取爬虫的四大基本数据
  const { data: fourBasicData } = useRequest(async () => {
    if(!transactionSet?.target){
      return;
    }
    const {basicInfos, dividends, unitPrices, splits} = await fetchBasicInfoUnitPriceSplitDividendByIdentifier([transactionSet.target])
    return {
      basicInfo: basicInfos[0],
      dividend: dividends[0],
      unitPrice: unitPrices[0],
      split: splits[0],
    }
  }, { refreshDeps: [transactionSet?.target] });

  // 获取交易记录
  const { data: transactions } = useRequest(async () => {
    if(!transactionSet?.target){
      return;
    }
    const transactionSets = await batchFetchTransaction([transactionSet])
    return transactionSets[0] ?? []
  }, { refreshDeps: [transactionSet?.target] });

  console.log('basicInfo, dividend, unitPrice, split', fourBasicData?.basicInfo, fourBasicData?.dividend, fourBasicData?.unitPrice, fourBasicData?.split);

  const priceChartData = useMemo(()=>{
    if(
      !transactionSet ||
      !fourBasicData ||
      !Array.isArray(fourBasicData.unitPrice) ||
      !Array.isArray(fourBasicData.dividend) ||
      !Array.isArray(fourBasicData.split) ||
      !Array.isArray(transactions) ||
      transactions.length === 0
    )  {
      return [];
    }
    const isArchivedSet = transactionSet.status === TransactionSetStatus.Archived;
    const formattedUnitPrices = sliceBetween(fourBasicData.unitPrice, transactions[0].date, isArchivedSet ? lastOfArray(transactions).date : dayjs())
    return formattedUnitPrices.map((unitPriceItem) => ({
      date: unitPriceItem.date.format('YYYY-MM-DD'),
      city: "London",
      unitPrice: unitPriceItem.price
    }))
  }, [fourBasicData?.unitPrice, fourBasicData?.dividend, fourBasicData?.split, transactions])

  return (
    <Fragment>
      <NavBar onBack={()=>{history.goBack()}}>{`[${transactionSet?.target ?? ''}] ${fourBasicData?.basicInfo.name ?? ''}`}</NavBar>
      <div>
        <Chart autoFit height={400} data={priceChartData} scale={{}}>
          <Legend
            // itemName={{
            //   style: (item) => {
            //     return { fill: item.name == 'Tokyo' ? colors[0] : colors[1] }
            //   }
            // }}
          />
          <Axis name="date" />
          <Axis name="unitPrice" />
          <Geom
            type="point"
            position="date*unitPrice"
            size={4}
            shape={"circle"}
            color={"city"}
            style={{
              stroke: "#fff",
              lineWidth: 1
            }}
          />
          <Geom
            type="line"
            position="date*unitPrice"
            size={2}
            color={"city"}
            shape={"smooth"}
          />
        </Chart>
      </div>
    </Fragment>
  );
}
