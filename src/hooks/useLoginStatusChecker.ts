import { useEffect } from 'react';
import cookies from 'js-cookie';
import { history } from 'umi';

export default function() {
  useEffect(()=>{
    if(window.location.pathname === '/login'){
      return;
    }
    const userId = cookies.get('wealthManagerSession')
    if(!userId){
      history.push('/login')
    }
  }, []);
};

