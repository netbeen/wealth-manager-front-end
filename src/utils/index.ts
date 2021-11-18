import { ORGANIZATION_COOKIE_NAME, SESSION_COOKIE_NAME } from '@/globalConst';
import cookies from 'js-cookie';

export const getAuthorizationData = () => ({
  session: cookies.get(SESSION_COOKIE_NAME) ?? '',
  organization: cookies.get(ORGANIZATION_COOKIE_NAME) ?? '',
});
