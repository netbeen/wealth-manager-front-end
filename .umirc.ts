import { IConfig } from 'umi-types';

// ref: https://umijs.org/config/
const config: IConfig = {
  antd: { mobile: false },
  title:'Wealth Manager',
  links: [{ rel: 'icon', href: '/img/logo.svg' }],
  metas: [{
    name: 'google-site-verification',
    content: 'nfOPr4G-D6vPaud2_lZtu7JpzA6FZ71Zy3XV-ekCL8w',
  }],
  webpack5: {},
  mfsu: {},
};

export default config;
