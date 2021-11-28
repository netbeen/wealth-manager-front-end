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

  const { priceChartData, rateOfReturnChartData } = useMemo(()=>{
    if(
      !transactionSet ||
      !fourBasicData ||
      !Array.isArray(fourBasicData.unitPrice) ||
      !Array.isArray(fourBasicData.dividend) ||
      !Array.isArray(fourBasicData.split) ||
      !Array.isArray(transactions) ||
      transactions.length === 0
    )  {
      return {
        priceChartData: [],
        rateOfReturnChartData: [],
      };
    }
    const isArchivedSet = transactionSet.status === TransactionSetStatus.Archived;
    const formattedUnitPrices = sliceBetween(fourBasicData.unitPrice, transactions[0].date, isArchivedSet ? lastOfArray(transactions).date : dayjs())
    const priceChartDataResult = formattedUnitPrices.map((unitPriceItem) => ({
      date: unitPriceItem.date.format('YYYY-MM-DD'),
      type: "unitPrice",
      price: unitPriceItem.price
    }))
    const rateOfReturnChartDataResult: any[] = [];
    formattedUnitPrices.forEach((formattedUnitPriceObject, index)=>{
      console.log(`calcReturn... ${index}/${formattedUnitPrices.length}`)
      const { unitCost, positionRateOfReturn, totalAnnualizedRateOfReturn } = calcReturn(
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
      rateOfReturnChartDataResult.push({
        date: formattedUnitPriceObject.date.format('YYYY-MM-DD'),
        type: "positionRateOfReturn",
        price: positionRateOfReturn
      }, {
        date: formattedUnitPriceObject.date.format('YYYY-MM-DD'),
        type: "totalAnnualizedRateOfReturn",
        price: totalAnnualizedRateOfReturn
      })
    })
    return {priceChartData: priceChartDataResult, rateOfReturnChartData: rateOfReturnChartDataResult};
  }, [fourBasicData?.unitPrice, fourBasicData?.dividend, fourBasicData?.split, transactions])

  console.log('priceChartData', priceChartData);

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
          <Tooltip shared showCrosshairs showMarkers linkage="someKey"/>
          <Legend />
          <Axis name="date" />
          <Axis name="price" />
          <Line shape="smooth" position="date*price" color="type"/>
        </Chart>
        <Chart
          autoFit
          height={300}
          data={rateOfReturnChartData}
          scale={{
            date: {
              type: 'timeCat',
              alias: '日期',
            },
            type: {
              formatter: (v: string) => {
                return {
                  positionRateOfReturn: '收益率',
                  totalAnnualizedRateOfReturn: '年化收益率'
                }[v]
              }
            }
          }}
          interactions={['tooltip', 'element-active']}
        >
          <Tooltip shared showCrosshairs showMarkers linkage="someKey"/>
          <Legend />
          <Axis name="date" />
          <Axis name="price" />
          <Line shape="smooth" position="date*price" color="type"/>
        </Chart>
      </div>
    </Fragment>
  );
}
