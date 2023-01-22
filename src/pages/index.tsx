import { history } from '@@/core/history';
import { useEffect } from 'react';

export default function () {
  useEffect(() => {
    history.push('/wealth/metrics');
  }, []);
  return <div> </div>;
}
