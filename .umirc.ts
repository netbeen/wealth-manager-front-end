import { IConfig } from 'umi-types';

// ref: https://umijs.org/config/
// @ts-ignore
const config: IConfig = { antd: { mobile: false },
  title: 'Wealth Manager',
  links: [{
    rel: 'icon',
    href: '/img/logo.svg',
  }],
  metas: [{
    name: 'google-site-verification',
    content: 'nfOPr4G-D6vPaud2_lZtu7JpzA6FZ71Zy3XV-ekCL8w',
  }, {
    name: 'keywords',
    content: 'fund, wealth, manager',
  }, {
    name: 'description',
    content: '一站式家庭财务管理平台',
  }],
  webpack5: {},
  // mfsu: {},
  scripts: [
    { src: '/workboxLoader.js', defer: true },
  ],
};

export default config;
