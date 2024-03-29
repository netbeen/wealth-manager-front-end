import { AntdBaseTable } from '@/components/AntDesignTable';
import { wealthSecondaryTabData } from '@/globalConst';
import { usePermission } from '@/hooks/usePermission';
import layoutStyles from '@/layouts/index.less';
import { getAllWealthCategory } from '@/services/wealthCategory';
import { getAllHistoryRecord } from '@/services/wealthHistory';
import { formatToCurrency } from '@/utils';
import { history } from '@@/core/history';
import { useRequest } from 'ahooks';
import { ArtColumn, ArtColumnAlign } from 'ali-react-table';
import { Button, Tabs } from 'antd-mobile';
import { Fragment, useMemo } from 'react';

const TabPane = Tabs.Tab;

export default function () {
  const { result: enableUpdate } = usePermission(['Admin', 'Collaborator']);

  const { data: allHistory, loading: allHistoryLoading } = useRequest(
    async () => {
      return await getAllHistoryRecord();
    },
    { refreshDeps: [] },
  );

  const { data: allWealthCategory } = useRequest(
    async () => {
      return await getAllWealthCategory();
    },
    {
      refreshDeps: [],
    },
  );

  const { tableData, columns } = useMemo<{ tableData: any[]; columns: ArtColumn[] }>(() => {
    if (
      !Array.isArray(allHistory) ||
      allHistory.length === 0 ||
      !Array.isArray(allWealthCategory) ||
      allWealthCategory.length === 0
    ) {
      return {
        tableData: [],
        columns: [],
      };
    }
    const existCategoryIdentifiers = new Set<string>();
    const tableData: Array<{ [key: string]: number | string }> = [];
    allHistory.forEach((historyItem) => {
      const currentRowData: { [key: string]: number | string } = {
        date: historyItem.date.format('YYYY-MM-DD'),
      };
      let netAssets = 0;
      Object.keys(historyItem.detail).forEach((categoryIdentifier) => {
        const numberValue = Number(historyItem.detail[categoryIdentifier]);
        if (numberValue === 0) {
          return;
        }
        const targetCategory = allWealthCategory.find((item) => item._id === categoryIdentifier);
        currentRowData[categoryIdentifier] = numberValue;
        netAssets += targetCategory?.type === 'debt' ? -numberValue : numberValue;
        existCategoryIdentifiers.add(categoryIdentifier);
      });
      currentRowData.sum = netAssets;
      tableData.push(currentRowData);
    });
    return {
      tableData,
      columns: [
        {
          code: 'date',
          name: '记录日期',
          align: 'left' as ArtColumnAlign,
          width: 100,
          render: (value: string) => value,
        },
        {
          code: 'sum',
          name: '净资产',
          align: 'right' as ArtColumnAlign,
          width: 100,
          render: (value) => formatToCurrency(value),
        },
        ...Array.from(existCategoryIdentifiers)
          .filter((categoryIdentifier) =>
            allWealthCategory.find((item) => item._id === categoryIdentifier),
          )
          .map((categoryIdentifier) => {
            const targetCategory = allWealthCategory.find(
              (item) => item._id === categoryIdentifier,
            );
            if (!targetCategory) {
              throw new Error('targetCategory not existed.');
            }
            return {
              code: categoryIdentifier as string,
              name: targetCategory.name ?? '',
              align: 'right' as ArtColumnAlign,
              width: 100,
              render: (value: number) => {
                if (isNaN(value)) {
                  return '--';
                }
                return formatToCurrency(value);
              },
            };
          }),
      ],
    };
  }, [allHistory, allWealthCategory]);

  const mainContent = useMemo(() => {
    const t = (
      <AntdBaseTable
        dataSource={tableData}
        columns={columns}
        isStickyHeader={false}
        isLoading={allHistoryLoading}
      />
    );
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Button
          color="primary"
          style={{ marginBottom: 12 }}
          onClick={() => {
            history.push('/wealth/record');
          }}
          disabled={!enableUpdate}
        >
          添加记录
        </Button>
        {t}
      </div>
    );
  }, [enableUpdate, tableData, columns]);

  return (
    <Fragment>
      <Tabs
        className={layoutStyles.mainContentTab}
        onChange={(key) => {
          history.push(wealthSecondaryTabData.find((item) => item.value === key)?.url ?? '');
        }}
        activeKey={'history'}
      >
        {wealthSecondaryTabData.map((item) => (
          <TabPane title={item.label} key={item.value}>
            {item.value === 'history' ? mainContent : <div />}
          </TabPane>
        ))}
      </Tabs>
    </Fragment>
  );
}
