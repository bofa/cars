import { DateTime } from "luxon"
const fs = require('fs')

const country = "Netherlands"
const old = [
  {"x": "2017-01-01", "bev": 494, "y": 50627, "total": 51121},
  {"x": "2017-02-01", "bev": 492, "y": 31494, "total": 31986},
  {"x": "2017-03-01", "bev": 752, "y": 35838, "total": 36590},
  {"x": "2017-04-01", "bev": 363, "y": 28820, "total": 29183},
  {"x": "2017-05-01", "bev": 528, "y": 35782, "total": 36310},
  {"x": "2017-06-01", "bev": 859, "y": 39926, "total": 40785},
  {"x": "2017-07-01", "bev": 398, "y": 32035, "total": 32433},
  {"x": "2017-08-01", "bev": 624, "y": 28469, "total": 29093},
  {"x": "2017-09-01", "bev": 1021, "y": 34409, "total": 35430},
  {"x": "2017-10-01", "bev": 725, "y": 35718, "total": 36443},
  {"x": "2017-11-01", "bev": 964, "y": 36605, "total": 37569},
  {"x": "2017-12-01", "bev": 1020, "y": 16345, "total": 17365},
  {"x": "2018-01-01", "bev": 1349, "y": 57396, "total": 58745},
  {"x": "2018-02-01", "bev": 934, "y": 34081, "total": 35015},
  {"x": "2018-03-01", "bev": 1726, "y": 40194, "total": 41920},
  {"x": "2018-04-01", "bev": 847, "y": 33005, "total": 33852},
  {"x": "2018-05-01", "bev": 1178, "y": 35532, "total": 36710},
  {"x": "2018-06-01", "bev": 2053, "y": 44693, "total": 46746},
  {"x": "2018-07-01", "bev": 1054, "y": 35056, "total": 36110},
  {"x": "2018-08-01", "bev": 1601, "y": 39318, "total": 40919},
  {"x": "2018-09-01", "bev": 2559, "y": 26742, "total": 29301},
  {"x": "2018-10-01", "bev": 2000, "y": 27463, "total": 29463},
  {"x": "2018-11-01", "bev": 3155, "y": 31453, "total": 34608},
  {"x": "2018-12-01", "bev": 6067, "y": 13775, "total": 19842},
  {"x": "2019-01-01", "bev": 2464, "y": 45237, "total": 47701},
  {"x": "2019-02-01", "bev": 2062, "y": 27885, "total": 29947},
  {"x": "2019-03-01", "bev": 4027, "y": 35099, "total": 39126},
  {"x": "2019-04-01", "bev": 2146, "y": 31003, "total": 33149},
  {"x": "2019-05-01", "bev": 2291, "y": 34539, "total": 36830},
  {"x": "2019-06-01", "bev": 4087, "y": 36939, "total": 41026},
  {"x": "2019-07-01", "bev": 2106, "y": 31434, "total": 33540},
  {"x": "2019-08-01", "bev": 2878, "y": 30846, "total": 33724},
  {"x": "2019-09-01", "bev": 7658, "y": 30048, "total": 37706},
  {"x": "2019-10-01", "bev": 2277, "y": 31495, "total": 33772},
  {"x": "2019-11-01", "bev": 6816, "y": 32276, "total": 39092},
  {"x": "2019-12-01", "bev": 22852, "y": 18752, "total": 41604}
]

  
const market = {
  country,
  data: old.map((d, i) => ({
    x: DateTime.fromISO(d.x),
    bev: d.bev,
    phev: null,
    hybrid: null,
    other: null,
    petrol: null,
    disel: null,
    total: d.total,
  }))
}

const filename = `./public/sales/cars-${market.country}.json`
let importData: any[] = []
try {
  importData = JSON.parse(fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' }))
  // console.log('importData', importData)
} catch (error) {
  // console.error(error)
}
importData.forEach(p => p.x = DateTime.fromISO(p.x, { zone: 'utc' }))

const flat = importData
  .concat(market.data)
  .reverse()

const unique = uniq(flat, 'x')
  .sort((a, b) => a.x - b.x)
// console.log('unique', unique)

fs.writeFileSync(filename, JSON.stringify(unique, null, 2))

function uniq<T extends Record<string, any>>(array: T[], key: keyof T) {
  let seen: any = {}
  return array.filter(function(item) {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true)
  })
}
