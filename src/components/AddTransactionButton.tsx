import { usePermission } from '@/hooks/usePermission';
import { history } from '@@/core/history';
import { Button } from 'antd-mobile';
import React from 'react';

export const AddTransactionButton: React.FC = () => {
  const { result: enableUpdate } = usePermission(['Admin', 'Collaborator']);

  return (
    <div className="mb-3">
      <Button
        color="primary"
        className="w-full"
        onClick={() => {
          history.push('/fund/transaction');
        }}
        disabled={!enableUpdate}
      >
        添加交易
      </Button>
    </div>
  );
};
