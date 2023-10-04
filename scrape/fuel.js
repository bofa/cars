import axios from 'axios'
import { promises as fs } from 'fs'
import getPetrolStatisticsSweden from './scb.js'

// const Papa =  require('papaparse');
// const norway2018 = require('./raw/norway2018');
// const norway2019 = require('./raw/norway2019');
// const netherlands2018 = require('./raw/netherlands2018');
// const netherlands2019 = require('./raw/netherlands2019');
// const spain2018 = require('./raw/spain2018');
// const spain2019 = require('./raw/spain2019');

Promise.all([
  getPetrolStatisticsSweden(axios),
  fs.readFile('public/swedenfuel.json', 'utf8').then(data => JSON.parse(data)),
])
.then(([data, oldData]) => {
  // TODO merge
  return fs.writeFile('public/swedenfuel.json', JSON.stringify(data, null, 2))
})
.then(() => {
    console.log('Done Sweden Fuel')
})

// export function massageJson (urls: string[], jsonData: any[]) {
//     // https://eu-evs.com/get_overall_stats_for_charts.php?year=2020&quarter=0&country=Norway
  
//     const sumFunc = (s: any) => s.data.reduce((sum: number, v: any) => sum + v.y, 0);

//     return Promise.all(urls.map(url => axios.get(url)))
//     //   .then(r => { console.log('r', r); return r; })
//       .then((response: any[]) => response.reduce((a, b) => a.concat(b.data), []).concat(jsonData))
//       .then(data => data as { BRAND: string, DATE: string, QUANTITY: string }[])
//       .then(data => data
//         .map(d => ({
//           t: moment(d.DATE),
//           y: Number(d.QUANTITY),
//           g: d.BRAND,
//           month: moment(d.DATE).startOf('month').valueOf()
//         }))
//         .sort((d1, d2) => d1.t.valueOf() - d2.t.valueOf())
//         // Group by brand
//         .reduce((acc: { [x: string]: { t: any; y: any; }[]; }, v) => {
//           if (acc[v.g] === undefined) {
//             acc[v.g] = [v];
//           } else {
//             acc[v.g].push(v);
//           }
  
//           return acc;
//         }, {}))
//       .then((data: any) => Object.keys(data)
//         .map(key => ({
//             label: key,
//             data: data[key]
//                 .reduce((acc: any[], v: any) => {
//                 if (acc.length === 0 || acc[acc.length - 1].month !== v.month) {
//                     acc.push(v);
//                 } else {
//                     acc[acc.length - 1].y += v.y;
//                 }
        
//                 return acc;
//                 }, [])
//         }))
//         .sort((s1, s2) => sumFunc(s2) - sumFunc(s1))
//         .filter((s: any, i) => i < 8)
//         // .filter((s: any) => sumFunc(s) > 1000)
//       );
// }

// console.log('norway2018', norway2018);

// const norway$ = massageJson(
//     ['https://eu-evs.com/CLASSIC/get_overall_stats_for_charts.php?year=2020&quarter=0&country=Norway'],
//     norway2018.concat(norway2019))
//     .then(data => fs.writeFile('public/norway.json', JSON.stringify(data)))
//     .then(() => console.log('Done Norway'));

// const netherlands$ = massageJson(
//     ['https://eu-evs.com/CLASSIC/get_overall_stats_for_charts.php?year=2020&quarter=0&country=Netherlands'],
//     netherlands2018.concat(netherlands2019))
//     .then(data => fs.writeFile('public/netherlands.json', JSON.stringify(data)))
//     .then(() => console.log('Done Netherlands'));

// const spain$ = massageJson(
//     ['https://eu-evs.com/CLASSIC/get_overall_stats_for_charts.php?year=2020&quarter=0&country=Spain'],
//     spain2018.concat(spain2019))
//     .then(data => fs.writeFile('public/spain.json', JSON.stringify(data)))
//     .then(() => console.log('Done Spain'));

// axios.get('https://www.ssb.no/eksport/tabell.csv?key=431798')
//   .then((response: any) => Papa.parse(response.data).data)    
//   .then((data: any) => fs.writeFile('public/norway-gas-months.json', JSON.stringify(data)))
//   .then(() => console.log('Done Norway Gas months'));

// axios.get('https://www.ssb.no/eksport/tabell.csv?key=416738')
//   .then((response: any) => Papa.parse(response.data).data)
//   .then((data: string[][]) => {
//     const extractIndices = [1, 3, 4, 5 , 6];
//     const years = data[0].filter((_, i) => extractIndices.includes(i))
//       .map(y => moment(y, 'YYYY'));

//     const output = data.slice(1).map(d => ({
//       label: d[0],
//       data: d.filter((_, i) => extractIndices.includes(i))
//         .map((v, i) => ({
//           t: years[i],
//           y: +v
//         }))
//         .reverse()
//     }));

//     return output;
//   })
//   .then((data: any) => fs.writeFile('public/norway-gas.json', JSON.stringify(data)))
//   .then(() => console.log('Done Norway Gas'));

// export function getNorwayMotorGas () {
//   return axios.post('https://data.ssb.no/api/v0/en/table/11174', {
//     'query': [
//       {
//         'code': 'Region',
//         'selection': {
//           'filter': 'item',
//           'values': [
//             '0'
//           ]
//         }
//       },
//       {
//         'code': 'Kjopegrupper',
//         'selection': {
//           'filter': 'item',
//           'values': [
//             '00',
//             '30',
//             '32',
//             '07',
//             '93'
//           ]
//         }
//       },
//       {
//         'code': 'PetroleumProd',
//         'selection': {
//           'filter': 'item',
//           'values': [
//             // '00',
//             '03',
//             // '04a',
//             // '04b',
//             // '06c',
//           ]
//         }
//       },
//       {
//         'code': 'ContentsCode',
//         'selection': {
//           'filter': 'item',
//           'values': [
//             'Petroleum'
//           ]
//         }
//       },
//       {
//         'code': 'Tid',
//         'selection': {
//           'filter': 'all',
//           'values': [
//             '*'
//           ]
//         }
//       }
//     ],
//     'response': {
//       'format': 'json-stat2'
//     }
//   }
//   ).then((response: any) => response.data.value)
//   .then((values: number[]) => [{
//     label: 'Motor gasoline',
//     data: values.map((v, i) => ({
//       t: moment('2010-01-01').add(i, 'months'),
//       y: v,
//     }))
//   }])
//   // .then((data: any) => fs.writeFile('public/norway-gas.json', JSON.stringify(data)))
//   // .then(() => console.log('Done Norway Gas'));
// }