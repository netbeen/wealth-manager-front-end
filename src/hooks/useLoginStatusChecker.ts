import { useEffect } from 'react';
import cookies from 'js-cookie';
import { history } from 'umi';
import { TOKEN_COOKIE_NAME } from '@/globalConst';
import { useLocation } from 'umi';

export const useLoginStatusChecker = () => {
  let location = useLocation();

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
