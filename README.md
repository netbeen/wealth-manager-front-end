# Wealth Manager V4

A web app deigned for managing your home wealth, especially funds and insurances.

## Features

- Overview: Show wealth distribution like percentage and amount of each investment approaches. 
- Funds: List each funds you have held and calculate the `ROR (Rate of Return)` and `AROR (Annualized Rate of Return)` to help you catch the good buy/sell opportunities.
- Insurances: List each insurances you held and send email notice before renew date.
- Common: Support multi-accounts under a single user.

## Development

```bash
cd wealth-manager-front-end/
yarn
yarn dev
```

## Release Note

### v4.0

- Released at 2022-01-22 
- Repos:
  - Client: [https://github.com/netbeen/wealth-manager-front-end](https://github.com/netbeen/wealth-manager-front-end)
  - Server: [https://github.com/netbeen/wealth-manager-serverless-api](https://github.com/netbeen/wealth-manager-serverless-api)
- Technology Stack
  - Client: Typescript, React, Umi.js, Ant Design, Ant Design Mobile, BizCharts
  - Server: Typescript, Node.js, Midway Serverless
  - Data: MongoDB
- Architecture
  - Cloud Native: Deploy client on Vercel.com, APIs on Tencent Cloud Serverless
  - Client Framework: Refactor client logic using Umi.js
  - Typescript: Restrict type on both client and server
- Feature:
  - Multiple Account: Enable multi-account for virtual account management, like co-account, permission control using RBAC
  - Mobile Default: Design layout for mobile device access
  - AROR Algorithm Update: Update algorithm of AROR to IRR
  - Insurance Management: List insurances you hold and remind you when approaching renew date.

![v4-screenshot](https://raw.githubusercontent.com/netbeen/wealth-manager-front-end/main/readme-images/v4-all.png)

### v3.0

- Released at 2019-01-20 
- Repo: [https://github.com/netbeen/wealth-manager](https://github.com/netbeen/wealth-manager)
- Technology Stack
  - Client: React, React Router, AISC, G2
  - Server: Node.js, Egg.js, Sequelize
  - Data: MySQL
- Architecture
  - React: Refactor all the client logic using React
  - Service Worker: Cache responses using Workbox
  - Server Framework: Refactor all the server logic using Egg.js, instead of Express
  - Container: Maintain system dependency in dockerfile
- Feature
  - Dark Mode: Enable dark mode
  - Multiple User: Enable sign in / sign out to support multiple users 

![v3-screenshot](https://raw.githubusercontent.com/netbeen/wealth-manager/master/readme/v3.png)

### v2.0

- Released at 2016-09-30
- Repo: [https://github.com/netbeen/FundManagerWeb](https://github.com/netbeen/FundManagerWeb)
- Technology Stack
  - Client: jQuery, Bootstrap, ECharts
  - Server: Node.js, Express
  - Data: MySQL
- Architecture
  - B/S: Change to B/S architecture to run crawler and reminder 24h
  - Storage: store transaction data using MySQL
- Features
  - Wealth Dashboard: Calculate percentage and amount of each invest approaches.
  - Buy/Sell Opportunities Reminder: Notice via email when AROR reaches 15%

![v2-screenshot](https://raw.githubusercontent.com/netbeen/wealth-manager/master/readme/v2.png)


### v1.0

- Released at 2016-01-12 
- Repo: [https://github.com/netbeen/FundManager](https://github.com/netbeen/FundManager)
- Technology Stack
  - Client: JavaScript, ECharts
  - Generator: Python, urllib
- Features
  - Grab funds price data using crawler
  - Calculate AROR using transactions stored in config file
  - Visualization using EChart

![v1-screenshot](https://raw.githubusercontent.com/netbeen/wealth-manager/master/readme/v1.jpg)
