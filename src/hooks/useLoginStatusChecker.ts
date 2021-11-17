import { useEffect } from 'react';
import cookies from 'js-cookie';
import { history } from 'umi';
import { SESSION_COOKIE_NAME } from '@/globalConst';

export default function() {
  useEffect(()=>{
    if(window.location.pathname === '/login'){
      return;
    }
    const userId = cookies.get(SESSION_COOKIE_NAME)
    if(!userId){
      history.push('/login')
    }
  }, []);
};
