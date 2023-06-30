import { Axis, Chart, Interval, Legend, Line, Tooltip } from 'bizcharts';

interface NetAssetsDataType {
  time: string;
  netAssets: number;
}

const TEXT = {
  netAssets: '净资产',
  growthRate: '环比增长率',
};

const netAssetsData: NetAssetsDataType[] = [
  {
    time: '2014Q2',
    netAssets: 1.6,
  },
  {
    time: '2014Q3',
    netAssets: 1.7,
  },
  {
    time: '2014Q4',
    netAssets: 2.9,
  },
  {
    time: '2015Q1',
    netAssets: 3.6,
  },
  {
    time: '2015Q2',
    netAssets: 4.2,
  },
  {
    time: '2015Q3',
    netAssets: 5.1,
  },
  {
    time: '2015Q4',
    netAssets: 5.8,
  },
  {
    time: '2016Q1',
    netAssets: 5.9,
  },
  {
    time: '2016Q2',
    netAssets: 8.3,
  },
  {
    time: '2016Q3',
    netAssets: 11,
  },
  {
    time: '2016Q4',
    netAssets: 15,
  },
  {
    time: '2017Q1',
    netAssets: 18,
  },
  {
    time: '2017Q2',
    netAssets: 26,
  },
  {
    time: '2017Q3',
    netAssets: 30,
  },
  {
    time: '2017Q4',
    netAssets: 34,
  },
  {
    time: '2018Q1',
    netAssets: 41,
  },
  {
    time: '2018Q2',
    netAssets: 44,
  },
  {
    time: '2018Q3',
    netAssets: 47,
  },
  {
    time: '2018Q4',
    netAssets: 48,
  },
  {
    time: '2019Q1',
    netAssets: 60,
  },
  {
    time: '2019Q2',
    netAssets: 74,
  },
  {
    time: '2019Q3',
    netAssets: 79,
  },
  {
    time: '2019Q4',
    netAssets: 88,
  },
  {
    time: '2020Q1',
    netAssets: 97,
  },
  {
    time: '2020Q2',
    netAssets: 133,
  },
  {
    time: '2020Q3',
    netAssets: 137,
  },
  {
    time: '2020Q4',
    netAssets: 127,
  },
  {
    time: '2021Q1',
    netAssets: 138,
  },
  {
    time: '2021Q2',
    netAssets: 175,
  },
  {
    time: '2021Q3',
    netAssets: 175,
  },
  {
    time: '2021Q4',
    netAssets: 187,
  },
  {
    time: '2022Q1',
    netAssets: 193,
  },
  {
    time: '2022Q2',
    netAssets: 216,
  },
  {
    time: '2022Q3',
    netAssets: 204,
  },
  {
    time: '2022Q4',
    netAssets: 228,
  },
  {
    time: '2023Q1',
    netAssets: 250,
  },
  {
    time: '2023Q2',
    netAssets: 272,
  },
];

const scale = {
  growthRate: {
    formatter: (val: number) => {
      return `${val.toFixed(1)}%`;
    },
    alias: TEXT.growthRate,
    type: 'linear-strict',
  },
  netAssets: {
    formatter: (val: number) => {
      return `${val}W`;
    },
    alias: TEXT.netAssets,
    type: 'linear-strict',
  },
};

const colors = ['#6394f9', '#62daaa'];

const calcGrowthRate: (inputData: NetAssetsDataType[]) => NetAssetsDataType[] = (inputData) =>
  inputData.map((item, index) => ({
    ...item,
    growthRate:
      index === 0
        ? 0
        : ((inputData[index].netAssets - inputData[index - 1].netAssets) /
            inputData[index - 1].netAssets) *
          100,
  }));

export default () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let chartIns: any = null;
  return (
    <div>
      <div
        style={{
          width: '100%',
          display: 'flex',
          fontSize: 20,
          justifyContent: 'center',
        }}
      >
        季度财务盘点
      </div>
      <Chart
        scale={scale}
        autoFit
        height={400}
        data={calcGrowthRate(netAssetsData)}
        onGetG2Instance={(chart: any) => {
          chartIns = chart;
        }}
      >
        <Legend
          custom={true}
          allowAllCanceled={true}
          items={[
            {
              value: 'netAssets',
              name: TEXT.netAssets,
              marker: {
                symbol: 'square',
                style: { fill: colors[0], r: 5 },
              },
            },
            {
              value: 'growthRate',
              name: TEXT.growthRate,
              marker: {
                symbol: 'hyphen',
                style: { stroke: colors[1], r: 5, lineWidth: 3 },
              },
            },
          ]}
        />
        <Tooltip shared={true} showCrosshairs={true} follow={true}></Tooltip>
        <Interval position="time*netAssets" color={colors[0]} />
        <Line position="time*growthRate" color={colors[1]} size={3} shape="smooth" />
        <Axis
          name="time"
          label={{ rotate: -45, autoRotate: true, style: { textAlign: 'end', fontSize: 10 } }}
        />
        <Axis name="growthRate" />
      </Chart>
    </div>
  );
};
