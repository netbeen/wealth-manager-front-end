import React from 'react';
import { Button } from 'antd-mobile';
import { history } from '@@/core/history';
import { usePermission } from '@/hooks/usePermission';

export const AddTransactionButton: React.FC = () => {
  const { result: enableCreateTransaction } = usePermission(['Admin', 'Collaborator']);

  return (
    <div className="mb-3">
      <Button
        color="primary"
        className="w-full"
        onClick={() => {
          history.push('/fund/transaction');
        }}
        disabled={!enableCreateTransaction}
      >
        添加交易
      </Button>
    </div>
  );
};