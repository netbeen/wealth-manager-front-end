import { Overview } from '@/components/Overview';
import { COLOR, fundSecondaryTabData } from '@/globalConst';
import layoutStyles from '@/layouts/index.less';
import {
  fetchBasicInfoUnitPriceSplitDividendByIdentifier,
  FundBasicInfoType,
  FundDividendType,
  FundPriceType,
  FundSpitType,
} from '@/services/fund';
import { batchFetchTransaction, TransactionType } from '@/services/transaction';
import { fetchTransactionSetsByStatus, TransactionSetStatus } from '@/services/transactionSet';
import { history } from '@@/core/history';
import { useAsyncEffect, useRequest } from 'ahooks';
import { Loading, Tabs } from 'antd-mobile';
import { Axis, Chart, Coordinate, Interaction, Interval, Line, Tooltip } from 'bizcharts';
import dayjs, { Dayjs } from 'dayjs';
import { calcReturn, sliceBetween } from 'fund-tools';
import { Fragment, useMemo, useState } from 'react';

const TabPane = Tabs.TabPane;

const restChartProps = {
  interactions: ['tooltip', 'element-active'],
  animate: false,
  padding: [10, 10, 60, 40],
  autoFit: true,
};

export default function () {
  const [fundBasicInfoList, setFundBasicInfoList] = useState<Array<FundBasicInfoType>>([]);
  const [unitPricesList, setUnitPricesList] = useState<Array<Array<FundPriceType>>>([]);
  const [dividendsList, setDividendsList] = useState<Array<Array<FundDividendType>>>([]);
  const [splitsList, setSplitsList] = useState<Array<Array<FundSpitType>>>([]);
  const [transactionsList, setTransactionsList] = useState<Array<Array<TransactionType>>>([]);

  const { data: transactionSets } = useRequest(
    async () => {
      return await fetchTransactionSetsByStatus(TransactionSetStatus.Active);
    },
    { refreshDeps: [] },
  );

  useAsyncEffect(async () => {
    if (!Array.isArray(transactionSets) || transactionSets.length === 0) {
      return;
    }
    const basicInfoUnitPriceSplitDividendResult =
      await fetchBasicInfoUnitPriceSplitDividendByIdentifier(
        transactionSets.map((transactionSet) => transactionSet.target),
      );
    setFundBasicInfoList(basicInfoUnitPriceSplitDividendResult.basicInfos);
    setUnitPricesList(basicInfoUnitPriceSplitDividendResult.unitPrices);
    setDividendsList(basicInfoUnitPriceSplitDividendResult.dividends);
    setSplitsList(basicInfoUnitPriceSplitDividendResult.splits);
    const transactionResult = await batchFetchTransaction(transactionSets);
    setTransactionsList(transactionResult);
  }, [transactionSets]);

  const tableData = useMemo(() => {
    if (!Array.isArray(transactionSets)) {
      return [];
    }
    return transactionSets
      .map((transactionSet, index) => {
        const rowData: {
          identifier: string;
          name?: string;
          positionValue: null | number;
          totalRateOfReturn: null | number;
          totalAnnualizedRateOfReturn: null | number;
          transactionSet: string;
          totalReturn: number | null;
          startDate: Dayjs | null;
        } = {
          identifier: transactionSet.target,
          name: fundBasicInfoList[index]?.name,
          positionValue: null,
          totalRateOfReturn: null,
          totalAnnualizedRateOfReturn: null,
          transactionSet: transactionSet._id,
          totalReturn: null,
          startDate: null,
        };
        if (
          !Array.isArray(unitPricesList[index]) ||
          !Array.isArray(dividendsList[index]) ||
          !Array.isArray(splitsList[index]) ||
          !Array.isArray(transactionsList[index])
        ) {
          return rowData;
        }
        const { positionValue, totalReturn, totalRateOfReturn, totalAnnualizedRateOfReturn } =
          calcReturn(
            sliceBetween(unitPricesList[index], transactionsList[index][0].date, dayjs()),
            dividendsList[index],
            splitsList[index],
            transactionsList[index],
          );
        rowData.positionValue = positionValue;
        rowData.totalRateOfReturn = totalRateOfReturn;
        rowData.totalAnnualizedRateOfReturn = totalAnnualizedRateOfReturn;
        rowData.totalReturn = totalReturn;
        rowData.startDate = transactionsList[index][0].date;
        return rowData;
      })
      .sort((a, b) => {
        if (a.positionValue && b.positionValue) {
          // 按照市值从高到低排序
          return b.positionValue - a.positionValue;
        } else {
          return 1;
        }
      });
  }, [
    transactionSets,
    fundBasicInfoList,
    unitPricesList,
    dividendsList,
    splitsList,
    transactionsList,
  ]);

  const { chartData, overviewData } = useMemo(() => {
    if (
      !Array.isArray(tableData) ||
      !tableData[0] ||
      typeof tableData[0].positionValue !== 'number'
    ) {
      return {
        chartData: [],
      };
    }
    const totalValue = tableData.reduce((pre, cur) => pre + (cur?.positionValue ?? 0), 0);
    const totalReturn = tableData.reduce((pre, cur) => pre + (cur?.totalReturn ?? 0), 0);

    return {
      chartData: tableData.map((item) => ({
        name: item.name,
        percentage: (item.positionValue ?? 0) / totalValue,
      })),
      overviewData: {
        totalValue,
        totalReturn,
      },
    };
  }, [tableData]);

  const overviewContent = useMemo(() => {
    if (!overviewData || !transactionSets || !Array.isArray(transactionSets)) {
      return null;
    }
    return (
      <Overview
        backgroundColor={overviewData.totalReturn > 0 ? COLOR.Profitable : COLOR.LossMaking}
        data={[
          [
            '总市值',
            Intl.NumberFormat('en-US', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            }).format(overviewData.totalValue),
          ],
          ['持仓品种', transactionSets.length.toString()],
          [
            '持仓收益',
            Intl.NumberFormat('en-US', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            }).format(overviewData.totalReturn),
          ],
          [
            '持仓收益率',
            Intl.NumberFormat('en-US', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
              style: 'percent',
            }).format(
              overviewData.totalReturn / (overviewData.totalValue - overviewData.totalReturn),
            ),
          ],
        ]}
      />
    );
  }, [overviewData]);

  const cols = {
    percentage: {
      formatter: (val: any) => {
        val =
          Intl.NumberFormat('en-US', {
            maximumFractionDigits: 1,
            minimumFractionDigits: 1,
          }).format(val * 100) + '%';
        return val;
      },
    },
  };

  const mainContent = useMemo(() => {
    if (chartData.length === 0) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Loading />
        </div>
      );
    }
    const profitHistoryChart = (
      <Chart
        height={250}
        data={[]}
        scale={{
          date: {
            type: 'time',
          },
          value: {
            type: 'linear',
            formatter: (v: string) => {
              return Intl.NumberFormat('en-US', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              }).format(Number(v));
            },
          },
          type: {
            formatter: (v: string) => {
              return {
                totalAssets: '总资产',
                netAssets: '净资产',
              }[v];
            },
          },
        }}
        {...restChartProps}
      >
        <Tooltip shared showCrosshairs showMarkers linkage="someKey" />
        <Axis name="date" />
        <Axis
          name="value"
          label={{
            formatter(text) {
              return `${Number(text.replace(/,/g, '')) / 10000}W`;
            },
          }}
        />
        <Line shape="smooth" position="date*value" color="type" />
      </Chart>
    );
    const distributionChart = (
      <Chart animate={false} height={300} data={chartData} scale={cols} autoFit>
        <Coordinate type="theta" radius={0.75} />
        <Tooltip showTitle={false} />
        <Axis visible={false} />
        <Interval
          position="percentage"
          adjust="stack"
          color="name"
          style={{
            lineWidth: 1,
            stroke: '#fff',
          }}
          label={[
            'percentage',
            {
              // label 太长自动截断
              layout: { type: 'limit-in-plot', cfg: { action: 'ellipsis' } },
              content: (data) => {
                return `${data.name}: ${Intl.NumberFormat('en-US', {
                  maximumFractionDigits: 1,
                  minimumFractionDigits: 1,
                }).format(data.percentage * 100)}%`;
              },
            },
          ]}
        />
        <Interaction type="element-single-selected" />
      </Chart>
    );
    return (
      <>
        {distributionChart}
        {profitHistoryChart}
      </>
    );
  }, [chartData]);

  return (
    <Fragment>
      <Tabs
        className={layoutStyles.mainContentTab}
        onChange={(key) => {
          history.push(fundSecondaryTabData.find((item) => item.value === key)?.url ?? '');
        }}
        activeKey={'metrics'}
      >
        {fundSecondaryTabData.map((item) => (
          <TabPane title={item.label} key={item.value}>
            {item.value === 'metrics' && (
              <div>
                {overviewContent}
                {mainContent}
              </div>
            )}
          </TabPane>
        ))}
      </Tabs>
    </Fragment>
  );
}
