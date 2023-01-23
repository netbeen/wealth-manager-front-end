import { AntdBaseTable } from '@/components/AntDesignTable';
import { insuranceSecondaryTabData } from '@/globalConst';
import { usePermission } from '@/hooks/usePermission';
import layoutStyles from '@/layouts/index.less';
import { fetchList, insuranceTypeName, INSURANCE_TYPE } from '@/services/insurance';
import { useRequest } from 'ahooks';
import { Button, Tabs } from 'antd-mobile';
import { useMemo } from 'react';
import { history } from 'umi';

const TabsPane = Tabs.Tab;

export default function () {
  const { result: enableUpdate } = usePermission(['Admin', 'Collaborator']);

  const { data: insuranceList, loading: insuranceListLoading } = useRequest(
    async () => {
      return await fetchList();
    },
    { refreshDeps: [] },
  );

  const mainContent = useMemo(
    () => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Button
          color="primary"
          style={{ marginBottom: 12 }}
          onClick={() => {
            history.push('/insurance/record');
          }}
          disabled={!enableUpdate}
        >
          添加保险
        </Button>
        {Array.isArray(insuranceList) && (
          <AntdBaseTable
            dataSource={insuranceList.map((insuranceRecord) => ({
              _id: insuranceRecord._id,
              type: insuranceTypeName[insuranceRecord.type as INSURANCE_TYPE],
              name: insuranceRecord.name,
              insured: insuranceRecord.insured,
              insuredAmount: insuranceRecord.insuredAmount,
            }))}
            columns={[
              {
                code: 'name',
                name: '名称',
                align: 'left',
                width: 140,
                render: (value: any, record: any) => (
                  <div
                    onClick={() => {
                      history.push(`/insurance/record?id=${record._id}`);
                    }}
                  >
                    {value}
                  </div>
                ),
              },
              {
                code: 'type',
                name: '类型',
                align: 'left',
                width: 50,
                render: (value: any) => value,
              },
              {
                code: 'insured',
                name: '被保险人',
                align: 'left',
                width: 75,
                render: (value: any) => value,
              },
              {
                code: 'insuredAmount',
                name: '保额',
                align: 'right',
                width: 75,
                render: (value: any) => value,
              },
            ]}
            isStickyHeader={false}
            isLoading={insuranceListLoading}
          />
        )}
      </div>
    ),
    [enableUpdate, insuranceList],
  );

  return (
    <Tabs
      className={layoutStyles.mainContentTab}
      onChange={(key) => {
        history.push(insuranceSecondaryTabData.find((item) => item.value === key)?.url ?? '');
      }}
      activeKey={'list'}
    >
      {insuranceSecondaryTabData.map((item) => (
        <TabsPane title={item.label} key={item.value}>
          {item.value === 'list' ? mainContent : <div />}
        </TabsPane>
      ))}
    </Tabs>
  );
}
