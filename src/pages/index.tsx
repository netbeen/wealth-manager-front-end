import React, { useEffect } from 'react';
import { history } from '@@/core/history';

export default function() {
  useEffect(()=>{history.push('/fund/position')}, [])
  return <div> </div>;
}
