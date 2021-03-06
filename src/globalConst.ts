export const API_PREFIX =
  window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5003'
    : 'https://wealth-manager-api.netbeen.top';

export const TOKEN_COOKIE_NAME = 'wealthManagerToken';
export const ORGANIZATION_COOKIE_NAME = 'wealthManagerOrganization';

export enum COLOR {
  Profitable = '#d20',
  LossMaking = '#093',
}

export const fundSecondaryTabData = [
  {
    value: 'metrics',
    label: '概览',
    url: '/fund/metrics',
  },
  {
    value: 'position',
    label: '当前持仓',
    url: '/fund/position',
  },
  {
    value: 'positionHistory',
    label: '历史持仓',
    url: '/fund/positionHistory',
  },
  {
    value: 'transactionList',
    label: '交易记录',
    url: '/fund/transactionList',
  },
];

export const wealthSecondaryTabData = [
  {
    value: 'metrics',
    label: '概览',
    url: '/wealth/metrics',
  },
  {
    value: 'history',
    label: '明细数据',
    url: '/wealth/history',
  },
];

export const insuranceSecondaryTabData = [
  {
    value: 'list',
    label: '列表',
    url: '/insurance/list',
  },
  {
    value: 'history',
    label: '缴费提醒',
    url: '/insurance/renewalReminder',
  },
];
