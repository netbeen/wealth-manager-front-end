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
import { Line, Chart, Geom, Axis, Tooltip, Legend, getTheme } from 'bizcharts';
import { fetchTransactionSetById, TransactionSetStatus } from '@/services/transactionSet';
import { batchFetchTransaction } from '@/services/transaction';
import { sliceBetween, lastOfArray, calcReturn } from 'fund-tools';

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
    const priceChartDataResult = formattedUnitPrices.map((unitPriceItem) => ({
      date: unitPriceItem.date.format('YYYY-MM-DD'),
      type: "unitPrice",
      price: unitPriceItem.price
    }))
    formattedUnitPrices.forEach((formattedUnitPriceObject)=>{
      const { unitCost } = calcReturn(
        sliceBetween(formattedUnitPrices, formattedUnitPrices[0].date, formattedUnitPriceObject.date),
        sliceBetween(fourBasicData.dividend, formattedUnitPrices[0].date, formattedUnitPriceObject.date),
        sliceBetween(fourBasicData.split, formattedUnitPrices[0].date, formattedUnitPriceObject.date),
        sliceBetween(transactions, formattedUnitPrices[0].date, formattedUnitPriceObject.date),
      );
      priceChartDataResult.push({
        date: formattedUnitPriceObject.date.format('YYYY-MM-DD'),
        type: "unitCost",
        price: unitCost
      })
    })
    return priceChartDataResult;
  }, [fourBasicData?.unitPrice, fourBasicData?.dividend, fourBasicData?.split, transactions])

  return (
    <Fragment>
      <NavBar onBack={()=>{history.goBack()}}>{`[${transactionSet?.target ?? ''}] ${fourBasicData?.basicInfo.name ?? ''}`}</NavBar>
      <div>
        <Chart
          autoFit
          height={300}
          data={priceChartData}
          scale={{
            date: {
              type: 'timeCat',
              alias: '日期',
            },
            type: {
              formatter: (v: string) => {
                return {
                  unitPrice: '单位净值',
                  unitCost: '持仓成本'
                }[v]
              }
            }
          }}
          interactions={['tooltip', 'element-active']}
        >
          <Tooltip shared showCrosshairs showMarkers/>
          <Legend
            // itemName={{
            //   style: (item) => {
            //     return { fill: item.name == 'Tokyo' ? colors[0] : colors[1] }
            //   }
            // }}
          />
          <Axis name="date" />
          <Axis name="price" />
          {/*<Geom*/}
          {/*  type="point"*/}
          {/*  position="date*unitPrice"*/}
          {/*  size={4}*/}
          {/*  shape={"circle"}*/}
          {/*  color={"city"}*/}
          {/*  style={{*/}
          {/*    stroke: "#fff",*/}
          {/*    lineWidth: 1*/}
          {/*  }}*/}
          {/*/>*/}
          <Line shape="smooth" position="date*price" color="type"/>
          {/*<Geom*/}
          {/*  type="line"*/}
          {/*  position="date*unitPrice"*/}
          {/*  size={2}*/}
          {/*  color={"city"}*/}
          {/*  shape={"smooth"}*/}
          {/*/>*/}
        </Chart>
      </div>
    </Fragment>
  );
}
