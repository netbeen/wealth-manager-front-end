import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
// @ts-ignore
import styles from '../position.less';
// @ts-ignore
import layoutStyles from '@/layouts/index.less';
import { ProgressCircle, NavBar } from 'antd-mobile'
import dayjs, { Dayjs } from 'dayjs';
import { useRequest } from 'ahooks'
import { history } from 'umi'
import {
  fetchBasicInfoUnitPriceSplitDividendByIdentifier, FundDividendType, FundPriceType, FundSpitType,
} from '@/services/fund';
import { Line, Chart, Axis, Tooltip } from 'bizcharts';
import { fetchTransactionSetById, TransactionSetStatus, TransactionSetType } from '@/services/transactionSet';
import { batchFetchTransaction, TransactionType } from '@/services/transaction';
import { sliceBetween, lastOfArray, calcReturn } from 'fund-tools';
import { roundWithPrecision } from '@/utils';

const restChartProps = {
  interactions: ['tooltip', 'element-active'],
  animate: false,
  padding: [10, 10, 60, 50],
  autoFit: true,
}

export default function({match: {params: {transactionSetId}}}: {match: {params: {transactionSetId: string}}}) {
  const { data: transactionSet } = useRequest(async () => {
    return await fetchTransactionSetById(transactionSetId)
  }, { refreshDeps: [] });

  // 获取爬虫的四大基本数据
  const { data: fourBasicData } = useRequest(async () => {
    if(!transactionSet?.target){
      return;
    }
    const { basicInfos, dividends, unitPrices, splits } = await fetchBasicInfoUnitPriceSplitDividendByIdentifier([transactionSet.target])
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

  const transactionChartData = useMemo(()=>{
    if(!transactions){
      return [];
    }
    return transactions.map(transaction => ({
      date: transaction.date.format('YYYY-MM-DD'),
      direction: transaction.direction,
      price: 1,
    }))
  }, [transactions])
  // 用于标记交易点位，还未实现，暂时log
  console.log('transactionChartData', transactionChartData);

  const [calcProgress, setCalcProgress] = useState<number>(0)
  const [priceChartData, setPriceChartData] = useState<{date: string; type: string; price: number}[]>([])
  const [rateOfReturnChartData, setRateOfReturnChartData] = useState<{date: string; type: string; rate: number}[]>([])
  const [annualizedRateOfReturnChartData, setAnnualizedRateOfReturnChartData] = useState<{date: string; type: string; rate: number}[]>([])

  // 计算Chart数据的异步函数，因为计算量太大，容易导致浏览器卡死，所以转换为异步函数，不block主线程渲染
  const calcChartData = useCallback(async (
    inputTransactionSet: TransactionSetType,
    inputUnitPrices: FundPriceType[],
    inputDividends: FundDividendType[],
    inputSplits: FundSpitType[],
    inputTransactions: TransactionType[],
  )=>{
    const isArchivedSet = inputTransactionSet.status === TransactionSetStatus.Archived;
    const formattedUnitPrices = sliceBetween(inputUnitPrices, inputTransactions[0].date, isArchivedSet ? lastOfArray(inputTransactions).date : dayjs())
    const priceChartDataResult = formattedUnitPrices.map((unitPriceItem) => ({
      date: unitPriceItem.date.format('YYYY-MM-DD'),
      type: "unitPrice",
      price: unitPriceItem.price
    }))
    const rateOfReturnChartDataResult: any[] = [];
    const annualizedRateOfReturnChartDataResult: any[] = [];
    for(let index = 0; index < formattedUnitPrices.length; index += 1){
      setCalcProgress(index/formattedUnitPrices.length);
      const { unitCost, positionRateOfReturn, totalAnnualizedRateOfReturn } = await new Promise((resolve)=>{
        const result = calcReturn(
          sliceBetween(formattedUnitPrices, formattedUnitPrices[0].date, formattedUnitPrices[index].date),
          sliceBetween(inputDividends, formattedUnitPrices[0].date, formattedUnitPrices[index].date),
          sliceBetween(inputSplits, formattedUnitPrices[0].date, formattedUnitPrices[index].date),
          sliceBetween(inputTransactions, formattedUnitPrices[0].date, formattedUnitPrices[index].date),
        )
        if(index % 10 === 0){
          setTimeout(()=>{
            resolve(result)
          }, 50)
        } else {
          resolve(result)
        }

      })
      priceChartDataResult.push({
        date: formattedUnitPrices[index].date.format('YYYY-MM-DD'),
        type: "unitCost",
        price: Math.round(unitCost * 10000)/10000
      })
      rateOfReturnChartDataResult.push(
        {
          date: formattedUnitPrices[index].date.format('YYYY-MM-DD'),
          type: "positionRateOfReturn",
          rate: Math.round(positionRateOfReturn * 100 * 100) / 100,
        }
      );
      annualizedRateOfReturnChartDataResult.push(
        {
          date: formattedUnitPrices[index].date.format('YYYY-MM-DD'),
          type: "totalAnnualizedRateOfReturn",
          rate: Math.round(totalAnnualizedRateOfReturn * 100 * 100)/100
        }
      )
    }
    setPriceChartData(priceChartDataResult);
    setRateOfReturnChartData(rateOfReturnChartDataResult);
    setAnnualizedRateOfReturnChartData(annualizedRateOfReturnChartDataResult);
    setCalcProgress(1);
  }, [])

  useEffect(()=>{
    if(
      !transactionSet ||
      !fourBasicData ||
      !Array.isArray(fourBasicData.unitPrice) ||
      !Array.isArray(fourBasicData.dividend) ||
      !Array.isArray(fourBasicData.split) ||
      !Array.isArray(transactions) ||
      transactions.length === 0
    )  {
      return;
    }
    calcChartData(
      transactionSet,
      fourBasicData.unitPrice,
      fourBasicData.dividend,
      fourBasicData.split,
      transactions
    );
  }, [fourBasicData?.unitPrice, fourBasicData?.dividend, fourBasicData?.split, transactions])

  const overviewData = useMemo(()=>{
    if(
      !transactionSet ||
      !fourBasicData ||
      !Array.isArray(fourBasicData.unitPrice) ||
      !Array.isArray(fourBasicData.dividend) ||
      !Array.isArray(fourBasicData.split) ||
      !Array.isArray(transactions) ||
      transactions.length === 0
    )  {
      return null;
    }
    const isArchivedSet = transactionSet.status === TransactionSetStatus.Archived;
    const formattedUnitPrices = sliceBetween(fourBasicData.unitPrice, transactions[0].date, isArchivedSet ? lastOfArray(transactions).date : dayjs())
    return calcReturn(
      sliceBetween(formattedUnitPrices, formattedUnitPrices[0].date, lastOfArray(formattedUnitPrices).date),
      sliceBetween(fourBasicData.dividend, formattedUnitPrices[0].date, lastOfArray(formattedUnitPrices).date),
      sliceBetween(fourBasicData.split, formattedUnitPrices[0].date, lastOfArray(formattedUnitPrices).date),
      sliceBetween(transactions, formattedUnitPrices[0].date, lastOfArray(formattedUnitPrices).date),
    )
  }, [fourBasicData?.unitPrice, fourBasicData?.dividend, fourBasicData?.split, transactions])

  const loadingTip = useMemo(()=>(
    <div style={{ width: '100%', textAlign: 'center', marginTop: '0.25rem' }}>
      <ProgressCircle
        percent={calcProgress * 100}
        style={{ '--track-width': '0.1rem', '--size': '3rem' }}
      >
        {`${Math.round(calcProgress * 100)}%`}
      </ProgressCircle>
    </div>
  ), [calcProgress])

  const chartContent = useMemo(()=>{
    if(!overviewData || !fourBasicData || !Array.isArray(fourBasicData?.unitPrice)){
      return null;
    }
    return (
    <Fragment>
      <div
        style={{

        }}
      >
        <div style={{
          display: 'flex'
        }}>
          <div style={{flexGrow: 1}}>总市值 {roundWithPrecision(overviewData.positionValue, 2)}</div>
          <div>更新日期 {lastOfArray(fourBasicData.unitPrice).date.format('YYYY-MM-DD')}</div>
        </div>
        <div style={{
          display: 'flex'
        }}>
          <div>持仓收益 {roundWithPrecision(overviewData.positionReturn, 2)}</div>
          <div>持仓收益率 {roundWithPrecision(overviewData.positionRateOfReturn*100, 2)}%</div>
          <div>年化收益率 {roundWithPrecision(overviewData.totalAnnualizedRateOfReturn*100, 2)}%</div>
        </div>
      </div>
      <Chart
        height={250}
        data={priceChartData}
        scale={{
          type: {
            formatter: (v: string) => {
              return {
                unitPrice: '单位净值',
                unitCost: '持仓成本'
              }[v]
            }
          }
        }}
        {...restChartProps}
      >
        <Tooltip shared showCrosshairs showMarkers linkage="someKey"/>
        <Axis name="date" />
        <Axis name="price" />
        <Line shape="smooth" position="date*price" color="type"/>
        {/*<View*/}
        {/*  data={transactionChartData}*/}
        {/*  padding={0}*/}
        {/*>*/}
        {/*  <Point*/}
        {/*    position="date*price"*/}
        {/*    // shape={['type', (type)=>{*/}
        {/*    //   if(type === 'unitCost'){*/}
        {/*    //     return 'circle';*/}
        {/*    //   }*/}
        {/*    //   return 'rect';*/}
        {/*    // }]}*/}
        {/*  />*/}
        {/*</View>*/}
      </Chart>
      <Chart
        height={200}
        data={rateOfReturnChartData}
        scale={{
          type: {
            formatter: (v: string) => {
              return {
                positionRateOfReturn: '收益率%',
              }[v]
            }
          }
        }}
        {...restChartProps}
      >
        <Tooltip shared showCrosshairs showMarkers linkage="someKey"/>
        <Axis name="date" />
        <Axis name="rate" />
        <Line shape="smooth" position="date*rate" color={["type", ['#F6903D']]}/>
      </Chart>
      <Chart
        height={200}
        data={annualizedRateOfReturnChartData}
        scale={{
          type: {
            formatter: (v: string) => {
              return {
                totalAnnualizedRateOfReturn: '年化收益率%'
              }[v]
            }
          },
        }}
        {...restChartProps}
      >
        <Tooltip shared showCrosshairs showMarkers linkage="someKey"/>
        <Axis name="date" />
        <Axis name="rate" />
        <Line shape="smooth" position="date*rate" color={["type", ['#F08BB4']]}/>
      </Chart>
    </Fragment>
  )}, [priceChartData, rateOfReturnChartData, annualizedRateOfReturnChartData]);

  return (
    <Fragment>
      <NavBar onBack={()=>{history.goBack()}}>{`[${transactionSet?.target ?? ''}] ${fourBasicData?.basicInfo.name ?? ''}`}</NavBar>
      <div>
        {
          calcProgress !== 1 ? (
            loadingTip
          ) : (
            chartContent
          )
        }
      </div>
    </Fragment>
  );
}
