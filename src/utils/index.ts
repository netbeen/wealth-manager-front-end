import { ORGANIZATION_COOKIE_NAME, TOKEN_COOKIE_NAME } from '@/globalConst';
import cookies from 'js-cookie';

export const getAuthorizationHeaders = () => ({
  'x-wm-token': cookies.get(TOKEN_COOKIE_NAME) ?? '',
  'x-wm-organization': cookies.get(ORGANIZATION_COOKIE_NAME) ?? '',
});

export const roundWithPrecision: (inputNumber: number, precision: number)=>number = (inputNumber, precision) => {
  return Math.round(inputNumber * (10 ** precision)) /  (10 ** precision)
};
