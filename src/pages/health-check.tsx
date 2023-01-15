import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const durationCalcInstance = axios.create();

// Record start timestamp
durationCalcInstance.interceptors.request.use((config) => {
  if (!config.headers) {
    throw new Error();
  }
  config.headers['request-startTime'] = new Date().getTime();
  return config;
});

// Calc duration
durationCalcInstance.interceptors.response.use((response) => {
  const currentTime = new Date().getTime();
  if (!response.config.headers || !response.headers) {
    throw new Error();
  }
  const startTime = response.config.headers['request-startTime'] as number;
  response.headers['request-duration'] = (currentTime - startTime).toString();
  return response;
});

const covertDurationToText: (duration: number | null) => string = (duration) =>
  duration === null ? 'N/A' : `${duration}ms`;

const exampleUrl = {
  html: `${window.location.protocol}//${window.location.host}/health-check`,
  js: `${window.location.protocol}://${window.location.host}/umi.js`,
  css: `${window.location.protocol}://${window.location.host}/umi.css`,
};

const getRequestDuration: (url: string) => Promise<number> = async (url) => {
  const response = await durationCalcInstance.get(url);
  return Number(response.headers['request-duration']);
};
export default function () {
  const [htmlRequestDuration, setHtmlRequestDuration] = useState<number | null>(null);
  const [jsRequestDuration, setJsRequestDuration] = useState<number | null>(null);
  const [cssRequestDuration, setCssRequestDuration] = useState<number | null>(null);

  const calc = useCallback(async () => {
    setHtmlRequestDuration(await getRequestDuration(exampleUrl.html));
    setJsRequestDuration(await getRequestDuration(exampleUrl.js));
    setCssRequestDuration(await getRequestDuration(exampleUrl.css));
  }, []);

  useEffect(() => {
    calc();
  }, []);

  return (
    <div>
      <div>health check result:</div>
      <div>htmlTimeCost: {covertDurationToText(htmlRequestDuration)}</div>
      <div>jsRequestDuration: {covertDurationToText(jsRequestDuration)}</div>
      <div>cssRequestDuration: {covertDurationToText(cssRequestDuration)}</div>
    </div>
  );
}
