import { DateTime } from "luxon"
const fs = require('fs')

const old = [
  {"Date": "2017-01-01", "Total-BEV": 1323, "Total-None-BEV": 240076, "Total": 241399},
  {"Date": "2017-02-01", "Total-BEV": 1546, "Total-None-BEV": 242056, "Total": 243602},
  {"Date": "2017-03-01", "Total-BEV": 2191, "Total-None-BEV": 357492, "Total": 359683},
  {"Date": "2017-04-01", "Total-BEV": 1408, "Total-None-BEV": 289289, "Total": 290697},
  {"Date": "2017-05-01", "Total-BEV": 1520, "Total-None-BEV": 322432, "Total": 323952},
  {"Date": "2017-06-01", "Total-BEV": 2196, "Total-None-BEV": 325497, "Total": 327693},
  {"Date": "2017-07-01", "Total-BEV": 1820, "Total-None-BEV": 281260, "Total": 283080},
  {"Date": "2017-08-01", "Total-BEV": 2177, "Total-None-BEV": 251503, "Total": 253680},
  {"Date": "2017-09-01", "Total-BEV": 2247, "Total-None-BEV": 285788, "Total": 288035},
  {"Date": "2017-10-01", "Total-BEV": 2180, "Total-None-BEV": 270675, "Total": 272855},
  {"Date": "2017-11-01", "Total-BEV": 3031, "Total-None-BEV": 299605, "Total": 302636},
  {"Date": "2017-12-01", "Total-BEV": 3412, "Total-None-BEV": 250538, "Total": 253950},
  {"Date": "2018-01-01", "Total-BEV": 2764, "Total-None-BEV": 266665, "Total": 269429},
  {"Date": "2018-02-01", "Total-BEV": 2546, "Total-None-BEV": 259203, "Total": 261749},
  {"Date": "2018-03-01", "Total-BEV": 3792, "Total-None-BEV": 343641, "Total": 347433},
  {"Date": "2018-04-01", "Total-BEV": 3171, "Total-None-BEV": 310884, "Total": 314055},
  {"Date": "2018-05-01", "Total-BEV": 2310, "Total-None-BEV": 302747, "Total": 305057},
  {"Date": "2018-06-01", "Total-BEV": 2651, "Total-None-BEV": 338657, "Total": 341308},
  {"Date": "2018-07-01", "Total-BEV": 2526, "Total-None-BEV": 315322, "Total": 317848},
  {"Date": "2018-08-01", "Total-BEV": 2457, "Total-None-BEV": 313948, "Total": 316405},
  {"Date": "2018-09-01", "Total-BEV": 2357, "Total-None-BEV": 197777, "Total": 200134},
  {"Date": "2018-10-01", "Total-BEV": 3390, "Total-None-BEV": 249238, "Total": 252628},
  {"Date": "2018-11-01", "Total-BEV": 4262, "Total-None-BEV": 268412, "Total": 272674},
  {"Date": "2018-12-01", "Total-BEV": 3836, "Total-None-BEV": 233222, "Total": 237058},
  {"Date": "2019-01-01", "Total-BEV": 4648, "Total-None-BEV": 261054, "Total": 265702},
  {"Date": "2019-02-01", "Total-BEV": 4637, "Total-None-BEV": 264230, "Total": 268867},
  {"Date": "2019-03-01", "Total-BEV": 6616, "Total-None-BEV": 338907, "Total": 345523},
  {"Date": "2019-04-01", "Total-BEV": 4768, "Total-None-BEV": 305947, "Total": 310715},
  {"Date": "2019-05-01", "Total-BEV": 4630, "Total-None-BEV": 328332, "Total": 332962},
  {"Date": "2019-06-01", "Total-BEV": 5760, "Total-None-BEV": 319471, "Total": 325231},
  {"Date": "2019-07-01", "Total-BEV": 5963, "Total-None-BEV": 326825, "Total": 332788},
  {"Date": "2019-08-01", "Total-BEV": 5001, "Total-None-BEV": 308747, "Total": 313748},
  {"Date": "2019-09-01", "Total-BEV": 5880, "Total-None-BEV": 238742, "Total": 244622},
  {"Date": "2019-10-01", "Total-BEV": 4979, "Total-None-BEV": 279614, "Total": 284593},
  {"Date": "2019-11-01", "Total-BEV": 4651, "Total-None-BEV": 294476, "Total": 299127},
  {"Date": "2019-12-01", "Total-BEV": 5748, "Total-None-BEV": 277632, "Total": 283380},
  {"Date": "2020-01-01", "Total-BEV": 7492, "Total-None-BEV": 238808, "Total": 246300},
  {"Date": "2020-02-01", "Total-BEV": 8154, "Total-None-BEV": 231789, "Total": 239943},
  {"Date": "2020-03-01", "Total-BEV": 10329, "Total-None-BEV": 204790, "Total": 215119},
  {"Date": "2020-04-01", "Total-BEV": 4635, "Total-None-BEV": 116205, "Total": 120840},
  {"Date": "2020-05-01", "Total-BEV": 5578, "Total-None-BEV": 162570, "Total": 168148},
  {"Date": "2020-06-01", "Total-BEV": 8119, "Total-None-BEV": 212153, "Total": 220272},
  {"Date": "2020-07-01", "Total-BEV": 16798, "Total-None-BEV": 298140, "Total": 314938},
  {"Date": "2020-08-01", "Total-BEV": 16076, "Total-None-BEV": 234968, "Total": 251044},
  {"Date": "2020-09-01", "Total-BEV": 21188, "Total-None-BEV": 244039, "Total": 265227},
  {"Date": "2020-10-01", "Total-BEV": 23158, "Total-None-BEV": 251145, "Total": 274303},
  {"Date": "2020-11-01", "Total-BEV": 28965, "Total-None-BEV": 261185, "Total": 290150},
  {"Date": "2020-12-01", "Total-BEV": 43671, "Total-None-BEV": 267723, "Total": 311394},
  {"Date": "2021-01-01", "Total-BEV": 16307, "Total-None-BEV": 153447, "Total": 169754},
  {"Date": "2021-02-01", "Total-BEV": 18273, "Total-None-BEV": 176076, "Total": 194349},
  {"Date": "2021-03-01", "Total-BEV": 30092, "Total-None-BEV": 262257, "Total": 292349},
  {"Date": "2021-04-01", "Total-BEV": 23810, "Total-None-BEV": 205840, "Total": 229650},
  {"Date": "2021-05-01", "Total-BEV": 26784, "Total-None-BEV": 203851, "Total": 230635},
  {"Date": "2021-06-01", "Total-BEV": 33420, "Total-None-BEV": 240732, "Total": 274152},
  {"Date": "2021-07-01", "Total-BEV": 25461, "Total-None-BEV": 210932, "Total": 236393},
  {"Date": "2021-08-01", "Total-BEV": 28857, "Total-None-BEV": 164450, "Total": 193307},
  {"Date": "2021-09-01", "Total-BEV": 33653, "Total-None-BEV": 163319, "Total": 196972},
  {"Date": "2021-10-01", "Total-BEV": 30554, "Total-None-BEV": 148129, "Total": 178683},
  {"Date": "2021-11-01", "Total-BEV": 40266, "Total-None-BEV": 157992, "Total": 198258},
  {"Date": "2021-12-01", "Total-BEV": 48432, "Total-None-BEV": 179198, "Total": 227630}
]

const market = {
  country: 'Germany',
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
