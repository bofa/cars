import { DateTime } from "luxon"
const fs = require('fs')

const country = "United Kingdom"
const old = [
  {"Date": "2021-01-01", "Total-BEV": 10564, "Total-None-Bev": 79685, "Total": 90249},
  {"Date": "2021-02-01", "Total-BEV": 10564, "Total-None-Bev": 40748, "Total": 51312},
  {"Date": "2021-03-01", "Total-BEV": 10564, "Total-None-Bev": 273400, "Total": 283964},
  {"Date": "2021-04-01", "Total-BEV": 14009, "Total-None-Bev": 127574, "Total": 141583},
  {"Date": "2021-05-01", "Total-BEV": 14009, "Total-None-Bev": 142728, "Total": 156737},
  {"Date": "2021-06-01", "Total-BEV": 14009, "Total-None-Bev": 172119, "Total": 186128},
  {"Date": "2021-07-01", "Total-BEV": 17030, "Total-None-Bev": 106266, "Total": 123296},
  {"Date": "2021-08-01", "Total-BEV": 17030, "Total-None-Bev": 51003, "Total": 68033},
  {"Date": "2021-09-01", "Total-BEV": 17030, "Total-None-Bev": 198282, "Total": 215312},
  {"Date": "2021-10-01", "Total-BEV": 10000, "Total-None-Bev": 96265, "Total": 106265},
  {"Date": "2021-11-01", "Total-BEV": 10000, "Total-None-Bev": 105706, "Total": 115706},
  {"Date": "2021-12-01", "Total-BEV": 10000, "Total-None-Bev": 98596, "Total": 108596}
]

  
const market = {
  country,
  data: old.map((d, i) => ({
    x: DateTime.fromISO(d.Date),
    bev: d["Total-BEV"],
    phev: null,
    hybrid: null,
    other: null,
    petrol: null,
    disel: null,
    total: d.Total,
  }))
}

const filename = `./public/sales-${market.country}.json`
let importData: any[] = []
try {
  importData = JSON.parse(fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' }))
  // console.log('importData', importData)
} catch (error) {
  // console.error(error)
}
importData.forEach(p => p.x = DateTime.fromISO(p.x))

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
