import React, { Fragment, useMemo } from 'react';
// @ts-ignore
import layoutStyles from '@/layouts/index.less';
import { Button, Tabs } from 'antd-mobile';
import { Line, Point, Chart, Axis, Tooltip } from 'bizcharts';
import { wealthSecondaryTabData } from '@/globalConst';
import { history } from '@@/core/history';
import { useRequest } from 'ahooks';
import { getAllHistoryRecord } from '@/services/wealthHistory';
import { getAllWealthCategory } from '@/services/wealthCategory';

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
    allHistory.forEach((historyItem)=>{
      const totalAssets = Object.keys(historyItem.detail).reduce((pre, cur)=>(
        pre + historyItem.detail[cur]
      ), 0);
      Object.keys(historyItem.detail).forEach((categoryIdentifier)=>{
        if(historyItem.detail[categoryIdentifier] === 0){
          return;
        }
        assetsCategoryDistributionChartData.push({
          date: historyItem.date.format('YYYY-MM-DD'),
          value: Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          }).format(historyItem.detail[categoryIdentifier] * 100 / totalAssets),
          category: categoryIdentifier
        })
      })
    })
    return {
      assetsCategoryDistributionChartData,
      assetChartData,
    };
    // priceChartDataResult.push({
    //   date: formattedUnitPrices[index].date.format('YYYY-MM-DD'),
    //   type: "unitCost",
    //   price: Math.round(unitCost * 10000)/10000
    // })
  }, [allHistory, allWealthCategory])

  console.log('assetsCategoryDistributionChartData', assetsCategoryDistributionChartData);
  const mainContent = useMemo(()=>{
    if(assetsCategoryDistributionChartData.length === 0){
      return '无数据'
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
        <Axis name="price" />
        <Line shape="smooth" position="date*value" color="category"/>
        {/*<Point position="date*value" />*/}
      </Chart>
      <Chart
        height={250}
        data={assetChartData}
        scale={{
          date: {
            type: 'time',
          },
          type: {
            formatter: (v: string) => {
              return ''
            }
          }
        }}
        {...restChartProps}
      >
        <Tooltip shared showCrosshairs showMarkers linkage="someKey"/>
        <Axis name="date" />
        <Axis name="price" />
        <Line shape="smooth" position="date*price" color="type"/>
      </Chart>
    </div>
  )},[assetsCategoryDistributionChartData, assetChartData, allWealthCategoryNameMapObject]);
  console.log('allWealthCategoryNameMapObject', allWealthCategoryNameMapObject);

  return (
    <Fragment>
      <Tabs
        className={layoutStyles.mainContentTab}
        onChange={(key)=>{history.push(wealthSecondaryTabData.find(item => item.value === key)?.url ?? '')}}
        activeKey={'metrics'}
      >
        {wealthSecondaryTabData.map(item => (
          <TabPane title={item.label} key={item.value}>
            {item.value === 'metrics' ? mainContent : <div/>}
          </TabPane>
        ))}
      </Tabs>
    </Fragment>
  );
}
