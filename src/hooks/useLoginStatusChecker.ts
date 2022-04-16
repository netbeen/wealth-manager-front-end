import { useEffect } from 'react';
import cookies from 'js-cookie';
import { history } from 'umi';
import { TOKEN_COOKIE_NAME } from '@/globalConst';

export const useLoginStatusChecker = () => {
  useEffect(() => {
    if (window.location.pathname === '/login') {
      return;
    }
    const userId = cookies.get(TOKEN_COOKIE_NAME);
    if (!userId) {
      history.push('/login');
    }
  }, []);
};
