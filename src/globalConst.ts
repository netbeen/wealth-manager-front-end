export const API_PREFIX = window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:5003' : 'https://service-0d8643vs-1302187355.hk.apigw.tencentcs.com/test'

export const TOKEN_COOKIE_NAME = 'wealthManagerToken'
export const ORGANIZATION_COOKIE_NAME = 'wealthManagerOrganization'

export enum COLOR {
  Profitable = '#d20',
  LossMaking = '#093'
}
