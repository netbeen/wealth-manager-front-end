import { TOKEN_COOKIE_NAME } from '@/globalConst';
import cookies from 'js-cookie';
import { useEffect } from 'react';
import { history, useLocation } from 'umi';

export const useLoginStatusChecker = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/login') {
      return;
    }
    const userId = cookies.get(TOKEN_COOKIE_NAME);
    if (!userId) {
      history.push('/login');
    }
  }, []);
};
