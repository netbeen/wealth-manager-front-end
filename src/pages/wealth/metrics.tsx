import React, { Fragment, useMemo } from 'react';
// @ts-ignore
import layoutStyles from '@/layouts/index.less';
import { Loading, Tabs } from 'antd-mobile';
import { Line, Chart, Axis, Tooltip } from 'bizcharts';
import { wealthSecondaryTabData } from '@/globalConst';
import { history } from '@@/core/history';
import { useRequest } from 'ahooks';
import { getAllHistoryRecord } from '@/services/wealthHistory';
import { getAllWealthCategory } from '@/services/wealthCategory';
import Overview from '@/components/overview';
import { irr } from 'financial';
import dayjs, { Dayjs } from 'dayjs';

// @ts-ignore
const TabPane = Tabs.TabPane

const restChartProps = {
  interactions: ['tooltip', 'element-active'],
  animate: false,
  padding: [10, 10, 60, 40],
  autoFit: true,
}

export default function() {
  const { data: allHistory, loading: allHistoryLoading } = useRequest(async () => {
    return await getAllHistoryRecord()
  }, { refreshDeps: [] });

  const { data: allWealthCategory } = useRequest(async () => {
    return await getAllWealthCategory()
  }, {
    refreshDeps: [],
  });

  const allWealthCategoryNameMapObject = useMemo(()=>{
    if(!allWealthCategory || allWealthCategory.length === 0){
      return {};
    }
    const result: {[key: string]: string} = {};
    allWealthCategory.forEach((categoryItem)=>{
      result[categoryItem._id] = categoryItem.name
    })
    return result;
  }, [allWealthCategory])

  const { assetsCategoryDistributionChartData, assetChartData } = useMemo(()=>{
    if(!Array.isArray(allHistory) || allHistory.length === 0 || !Array.isArray(allWealthCategory) || allWealthCategory.length === 0){
      return {
        assetsCategoryDistributionChartData: [],
        assetChartData: []
      };
    }
    const assetsCategoryDistributionChartData: any[] = [];
    const assetChartData: any[] = [];
    const displayCategoryId = Array.from(new Set(allHistory.map(historyItem => (Object.keys(historyItem.detail).filter(categoryId => historyItem.detail[categoryId] > 0))).flat(1)))
    allHistory.reverse().forEach((historyItem)=>{
      const totalAssets = Object.keys(historyItem.detail).reduce((pre, cur)=>{
        const targetCategory = allWealthCategory.find(item => item._id === cur);
        if(targetCategory?.type === 'debt'){
          return (pre)
        }
        return (
          pre + historyItem.detail[cur]
        )
      }, 0);
      const netAssets = Object.keys(historyItem.detail).reduce((pre, cur)=>{
        const targetCategory = allWealthCategory.find(item => item._id === cur);
        if(targetCategory?.type === 'debt'){
          return (
            pre - historyItem.detail[cur]
          )
        }
        return (
          pre + historyItem.detail[cur]
        )
      }, 0);
      assetChartData.push({
        date: historyItem.date.format('YYYY-MM-DD'),
        value: totalAssets,
        type: 'totalAssets',
      })
      assetChartData.push({
        date: historyItem.date.format('YYYY-MM-DD'),
        value: netAssets,
        type: 'netAssets',
      })
      displayCategoryId.forEach((categoryIdentifier)=>{
        const targetCategory = allWealthCategory.find(item => item._id === categoryIdentifier);
        if(targetCategory?.type === 'debt'){
          return;
        }
        assetsCategoryDistributionChartData.push({
          date: historyItem.date.format('YYYY-MM-DD'),
          value: Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          }).format(totalAssets === 0 ? 0 : historyItem.detail[categoryIdentifier] * 100 / totalAssets),
          category: categoryIdentifier
        })
      })
    })
    return {
      assetsCategoryDistributionChartData,
      assetChartData,
    };
  }, [allHistory, allWealthCategory])

  const overviewContent = useMemo(()=>{
    if(!Array.isArray(assetChartData) || assetChartData.length === 0){
      return null;
    }
    const {netAssets, endDate}: {netAssets: number, endDate: Dayjs} = {
        netAssets: [...assetChartData].reverse().find(item => item.type === 'netAssets').value,
        endDate: dayjs([...assetChartData].reverse().find(item => item.type === 'netAssets').date),
    };
    const {netAssetsAtStartDate, startDate}: {netAssetsAtStartDate: number, startDate: Dayjs} = {
      netAssetsAtStartDate: [...assetChartData].find(item => item.type === 'netAssets').value,
      startDate: dayjs([...assetChartData].find(item => item.type === 'netAssets').date),
    };

    const duration = endDate.diff(startDate, 'day')
    const irrData = [];
    for(let i = 0; i < (duration + 1); i++){
      if(i === 0){
        irrData.push(-netAssetsAtStartDate)
      } else if(i === duration - 1) {
        irrData.push(netAssets)
      } else {
        irrData.push(0)
      }
    }
    // 年复合增长率算法：irr
    const compoundAnnualGrowthRate = irr(irrData, 0, 0.00001, 1000) * 365;

    const totalAssets: number = [...assetChartData].reverse().find(item => item.type === 'totalAssets').value;
    return (
      <Overview
        backgroundColor={'#1677ff'}
        data={[
          ['净资产', Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          }).format(netAssets)],
          ['更新日期', assetChartData[assetChartData.length - 1].date],
          ['总资产', Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          }).format(totalAssets)],
          ['年复合增长率', Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          }).format(compoundAnnualGrowthRate*100)+'%'],
          ['资产负债率', Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          }).format((totalAssets - netAssets)/totalAssets*100)+'%'],
        ]}
      />
    );
  }, [assetChartData])

  const mainContent = useMemo(()=>{
    if(assetsCategoryDistributionChartData.length === 0){
      return <div style={{textAlign: 'center'}}><Loading /></div>
    }
    return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <Chart
        height={250}
        data={assetsCategoryDistributionChartData}
        scale={{
          date: {
            type: 'time',
          },
          value: {
            type:"linear",
            min: 0,
            max: 100,
            formatter: (v: string) => {
              return `${v}%`
            }
          },
          category: {
            formatter: (v: string) => {
              return allWealthCategoryNameMapObject[v]
            }
          }
        }}
        {...restChartProps}
      >
        <Tooltip shared showCrosshairs showMarkers linkage="someKey"/>
        <Axis name="date" />
        <Axis name="value" />
        <Line shape="smooth" position="date*value" color="category"/>
      </Chart>
      <Chart
        height={250}
        data={assetChartData}
        scale={{
          date: {
            type: 'time',
          },
          value: {
            type:"linear",
            formatter: (v: string) => {
              return Intl.NumberFormat('en-US', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
              }).format(Number(v))
            }
          },
          type: {
            formatter: (v: string) => {
              return {
                totalAssets: '总资产',
                netAssets: '净资产',
              }[v]
            }
          }
        }}
        {...restChartProps}
      >
        <Tooltip shared showCrosshairs showMarkers linkage="someKey"/>
        <Axis name="date" />
        <Axis name="value" label={{
          formatter(text) {
            return `${Number(text.replace(/,/g,''))/10000}W`;
          }
        }}/>
        <Line shape="smooth" position="date*value" color="type"/>
      </Chart>
    </div>
  )},[assetsCategoryDistributionChartData, assetChartData, allWealthCategoryNameMapObject]);

  return (
    <Fragment>
      <Tabs
        className={layoutStyles.mainContentTab}
        onChange={(key)=>{history.push(wealthSecondaryTabData.find(item => item.value === key)?.url ?? '')}}
        activeKey={'metrics'}
      >
        {wealthSecondaryTabData.map(item => (
          <TabPane title={item.label} key={item.value}>
            {item.value === 'metrics' ? <div>
              {overviewContent}
              {mainContent}
            </div> : <div/>}
          </TabPane>
        ))}
      </Tabs>
    </Fragment>
  );
}
