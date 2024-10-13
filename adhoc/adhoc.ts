import { DateTime } from "luxon"
const fs = require('fs')

const country = "Denmark"
const old = [
  {"Date": "2020-01-01", "Total-BEV": 530, "Total-None-BEV": 18136, "Total": 18666},
  {"Date": "2020-02-01", "Total-BEV": 495, "Total-None-BEV": 14508, "Total": 15003},
  {"Date": "2020-03-01", "Total-BEV": 1114, "Total-None-BEV": 14064, "Total": 15178},
  {"Date": "2020-04-01", "Total-BEV": 372, "Total-None-BEV": 9826, "Total": 10198},
  {"Date": "2020-05-01", "Total-BEV": 374, "Total-None-BEV": 11051, "Total": 11425},
  {"Date": "2020-06-01", "Total-BEV": 828, "Total-None-BEV": 17108, "Total": 17936},
  {"Date": "2020-07-01", "Total-BEV": 488, "Total-None-BEV": 18468, "Total": 18956},
  {"Date": "2020-08-01", "Total-BEV": 1015, "Total-None-BEV": 16593, "Total": 17608},
  {"Date": "2020-09-01", "Total-BEV": 2340, "Total-None-BEV": 14857, "Total": 17197},
  {"Date": "2020-10-01", "Total-BEV": 1097, "Total-None-BEV": 13975, "Total": 15072},
  {"Date": "2020-11-01", "Total-BEV": 1737, "Total-None-BEV": 16431, "Total": 18168},
  {"Date": "2020-12-01", "Total-BEV": 3845, "Total-None-BEV": 18894, "Total": 22739},
  {"Date": "2021-01-01", "Total-BEV": 577, "Total-None-BEV": 9949, "Total": 10526},
  {"Date": "2021-02-01", "Total-BEV": 347, "Total-None-BEV": 9565, "Total": 9912},
  {"Date": "2021-03-01", "Total-BEV": 2074, "Total-None-BEV": 21662, "Total": 23736},
  {"Date": "2021-04-01", "Total-BEV": 1010, "Total-None-BEV": 14515, "Total": 15525},
  {"Date": "2021-05-01", "Total-BEV": 1153, "Total-None-BEV": 15672, "Total": 16825},
  {"Date": "2021-06-01", "Total-BEV": 2274, "Total-None-BEV": 17997, "Total": 20271},
  {"Date": "2021-07-01", "Total-BEV": 1342, "Total-None-BEV": 12060, "Total": 13402},
  {"Date": "2021-08-01", "Total-BEV": 3050, "Total-None-BEV": 12794, "Total": 15844},
  {"Date": "2021-09-01", "Total-BEV": 3189, "Total-None-BEV": 11032, "Total": 14221},
  {"Date": "2021-10-01", "Total-BEV": 2130, "Total-None-BEV": 10536, "Total": 12666},
  {"Date": "2021-11-01", "Total-BEV": 3030, "Total-None-BEV": 11926, "Total": 14956},
  {"Date": "2021-12-01", "Total-BEV": 4765, "Total-None-BEV": 13002, "Total": 17767}
]
  
const market = {
  country,
  data: old.map((d, i) => ({
    x: DateTime.fromISO(d.Date),
    total: d.Total,
    bev: d["Total-BEV"],
    phev: null,
    hybrid: null,
    other: null,
    petrol: null,
    disel: null,
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
