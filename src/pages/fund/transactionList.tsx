import React, { Fragment, useMemo } from 'react';
// @ts-ignore
import layoutStyles from '@/layouts/index.less';
import { Tabs } from 'antd-mobile';
import { COLOR, fundSecondaryTabData } from '@/globalConst';
import { history } from '@@/core/history';
import { useRequest } from 'ahooks';
import { fetchAllTransactionSets } from '@/services/transactionSet';
import { batchFetchTransaction, TRANSACTION_DIRECTION } from '@/services/transaction';
import { AntdBaseTable } from '@/components/antDesignTable';
import { fetchBasicInfoUnitPriceSplitDividendByIdentifier } from '@/services/fund';

// @ts-ignore
const TabPane = Tabs.TabPane

export default function() {
  const { data: transactionSets, loading: transactionSetsLoading } = useRequest(async () => {
    return await fetchAllTransactionSets()
  }, { refreshDeps: [] });

  const { data: fourBasicInfo, loading: fourBasicInfoLoading } = useRequest(async () => {
    if(!transactionSets){
      return {
        basicInfos: [],
        unitPrices: [],
      };
    }
    return (await fetchBasicInfoUnitPriceSplitDividendByIdentifier(transactionSets.map(transactionSet => transactionSet.target)))
  }, { refreshDeps: [transactionSets] });

  const { data: transactions, loading: transactionsLoading } = useRequest(async () => {
    if(!transactionSets){
      return [];
    }
    const remoteResult = await batchFetchTransaction(transactionSets);
    return remoteResult
      .flat(1)
      .sort((a, b)=>(a.date.isAfter(b.date) ? -1 :  1))
  }, { refreshDeps: [transactionSets] });

  const mainContent = useMemo(()=>{
    let loading = true;

    if(
      transactions && fourBasicInfo &&
      fourBasicInfo.basicInfos?.length > 0 &&
      fourBasicInfo.unitPrices?.length > 0 &&
      transactionSets
    ){
      loading = false;
    }

    const dataSource = loading ? [] : transactions.map(transaction => {
      const targetTransactionSet = transactionSets.find(transactionSet => transactionSet._id === transaction.transactionSet)
      if(!targetTransactionSet){
        return null;
      }
      const transactionIndex= transactionSets.map(item => item._id).indexOf(targetTransactionSet._id);
      if(transactionIndex === -1){
        console.error('find targetTransactionSet failed', targetTransactionSet, transactionSets)
      }
      const targetBasicInfo = fourBasicInfo.basicInfos[transactionIndex];
      const targetUnitPrices = fourBasicInfo.unitPrices[transactionIndex];
      const targetUnitPrice = targetUnitPrices.find(item => item.date.isSame(transaction.date))?.price ?? 0;

      return ({
        name: targetBasicInfo?.name,
        date: transaction.date.format('YYYY-MM-DD'),
        direction: transaction.direction,
        transactionValue: Math.round(((targetUnitPrice * transaction.volume) + transaction.commission) * 10)/10,
      })
    }).filter(item => item);

    return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <AntdBaseTable
        dataSource={dataSource}
        columns={[{
          code: 'name',
          name: '基金名称',
          width: 150,
          align: 'left',
        }, {
          code: 'date',
          name: '交易日期',
          width: 100,
          align: 'right',
        }, {
          code: 'date',
          name: <div><div>交易方向</div><div>交易金额</div></div>,
          width: 100,
          align: 'right',
          render: (value: any, record: any) => (
            <div>
              <div style={{color: record.direction === TRANSACTION_DIRECTION.BUY ? COLOR.LossMaking : COLOR.Profitable}}>
                {record.direction === TRANSACTION_DIRECTION.BUY ? '买入' : '卖出'}
              </div>
              <div>
                {Intl.NumberFormat('en-US', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                }).format(record.transactionValue)}
              </div>
            </div>
          )
        }]}
        isStickyHeader={false}
        isLoading={transactionSetsLoading || transactionsLoading || fourBasicInfoLoading}
      />
    </div>
  )},[transactionSets, transactions, transactionSetsLoading, transactionsLoading, fourBasicInfo, fourBasicInfoLoading]);

  return (
    <Fragment>
      <Tabs
        className={layoutStyles.mainContentTab}
        onChange={(key)=>{history.push(fundSecondaryTabData.find(item => item.value === key)?.url ?? '')}}
        activeKey={'transactionList'}
      >
        {fundSecondaryTabData.map(item => (
          <TabPane title={item.label} key={item.value}>
            {item.value === 'transactionList' ? mainContent : <div/>}
          </TabPane>
        ))}
      </Tabs>
    </Fragment>
  );
}
