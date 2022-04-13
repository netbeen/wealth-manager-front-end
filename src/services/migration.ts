// import dayjs, { Dayjs } from 'dayjs';
// // @ts-ignore
// import source from './testData/zxy';
// import { insertWealthHistoryRecord } from '@/services/wealthHistory';
//
// const a = [
//   {
//     "_id": {"$oid": "61ac9209fe1d025b40343661"},
//     "name": "CNY长期存款"
//   },
//   {
//     "_id": {"$oid": "61ac9209fe1d025b40343662"},
//     "name": "USD短期存款"
//   },
//   {
//     "_id": {"$oid": "61ac920afe1d025b40343663"},
//     "name": "基金"
//   },
//   {
//     "_id": {"$oid": "61ac920afe1d025b40343664"},
//     "name": "P2P"
//   },
//   {
//     "_id": {"$oid": "61ac920afe1d025b40343665"},
//     "name": "CNY股票"
//   },
//   {
//     "_id": {"$oid": "61ac920bfe1d025b40343666"},
//     "name": "USD股票"
//   },
//   {
//     "_id": {"$oid": "61ac920bfe1d025b40343667"},
//     "name": "信用贷款"
//   }
// ]
//
// // getNUmberFromWealthRecordItems
// const get = (wealthRecordItems: any, categoryId: number) => {
//   const result = Number(wealthRecordItems.find((recordItem: any) => recordItem.categoryId === categoryId)?.value);
//   if(isNaN(result)){
//     return 0;
//   }else{
//     return result
//   }
// }
//
// export default async () => {
//   console.log('source', source);
//   const formattedData = source.map(item => {
//     const wr = item.wealthRecordItems;
//     const date = dayjs(item.date).hour(0).minute(0).second(0).millisecond(0) as Dayjs;
//     return {
//       date,
//       detail: {
//         // CNY现金
//         '61ac9155fe1d025b4034365d': get(wr,22),
//         // CNY短期存款&货币基金
//         '61ac9208fe1d025b40343660': get(wr,6) + get(wr,8),
//           // - (date.isAfter(dayjs('2020-04-29')) ? 100000 : 0),
//         // CNY长期存款
//         // '61ac9209fe1d025b40343661': date.isAfter(dayjs('2020-04-29')) ? 100000 : 0,
//         // USD短期存款
//         '61ac9209fe1d025b40343662': get(wr,26),
//         // 基金
//         '61ac920afe1d025b40343663': get(wr,9)+ get(wr,10) + get(wr,11) + get(wr,12) + get(wr,13),
//         // P2P
//         '61ac920afe1d025b40343664': get(wr,14)+ get(wr,15) + get(wr,16) +
//           get(wr,17) + get(wr,18) + get(wr,19) + get(wr,20),
//         // CNY股票
//         '61ac920afe1d025b40343665': get(wr,29),
//         // USD股票
//         '61ac920bfe1d025b40343666': get(wr,28),
//         // 信用贷款
//         '61ac920bfe1d025b40343667': get(wr,23)+ get(wr,25),
//       },
//     }
//   })
//   console.log('formattedData', formattedData);
//   await Promise.all(formattedData.map((item)=>(new Promise((resolve)=>{
//     insertWealthHistoryRecord(item.date, item.detail).then(()=>{resolve(0)})
//   }))))
// }
