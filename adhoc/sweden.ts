import { DateTime } from "luxon"
const fs = require('fs')

const swedenOld = [
  {"dev": 108, "disel": 21540, "total": 21648},
  {"dev": 131, "disel": 26735, "total": 26866},
  {"dev": 309, "disel": 34401, "total": 34710},
  {"dev": 254, "disel": 33322, "total": 33576},
  {"dev": 164, "disel": 34307, "total": 34471},
  {"dev": 194, "disel": 36111, "total": 36305},
  {"dev": 118, "disel": 24073, "total": 24191},
  {"dev": 128, "disel": 27183, "total": 27311},
  {"dev": 295, "disel": 31995, "total": 32290},
  {"dev": 130, "disel": 31710, "total": 31840},
  {"dev": 234, "disel": 31564, "total": 31798},
  {"dev": 482, "disel": 36799, "total": 37281},
  {"dev": 241, "disel": 23040, "total": 23281},
  {"dev": 226, "disel": 27457, "total": 27683},
  {"dev": 580, "disel": 37796, "total": 38376},
  {"dev": 378, "disel": 30083, "total": 30461},
  {"dev": 372, "disel": 34948, "total": 35320},
  {"dev": 434, "disel": 37888, "total": 38322},
  {"dev": 196, "disel": 24523, "total": 24719},
  {"dev": 393, "disel": 29520, "total": 29913},
  {"dev": 315, "disel": 31356, "total": 31671},
  {"dev": 137, "disel": 31972, "total": 32109},
  {"dev": 170, "disel": 32312, "total": 32482},
  {"dev": 292, "disel": 34663, "total": 34955},
  {"dev": 186, "disel": 1808, "total": 1994},
  {"dev": 319, "disel": 26891, "total": 27210},
  {"dev": 749, "disel": 36456, "total": 37205},
  {"dev": 371, "disel": 23832, "total": 24203},
  {"dev": 279, "disel": 37406, "total": 37685},
  {"dev": 336, "disel": 65892, "total": 66228},
  {"dev": 521, "disel": 11982, "total": 12503},
  {"dev": 559, "disel": 24111, "total": 24670},
  {"dev": 660, "disel": 18450, "total": 19110},
  {"dev": 796, "disel": 22212, "total": 23008},
  {"dev": 1204, "disel": 24607, "total": 25811},
  {"dev": 1099, "disel": 21900, "total": 22999},
  {"dev": 1085, "disel": 19389, "total": 20474},
  {"dev": 899, "disel": 22247, "total": 23146},
  {"dev": 2114, "disel": 28141, "total": 30255},
  {"dev": 1374, "disel": 28872, "total": 30246},
  {"dev": 1228, "disel": 30690, "total": 31918},
  {"dev": 1673, "disel": 30155, "total": 31828},
  {"dev": 1076, "disel": 22577, "total": 23653},
  {"dev": 961, "disel": 28516, "total": 29477},
  {"dev": 1753, "disel": 25004, "total": 26757},
  {"dev": 808, "disel": 28822, "total": 29630},
  {"dev": 1031, "disel": 29470, "total": 30501},
  {"dev": 1608, "disel": 46520, "total": 48128},
  {"dev": 1228, "disel": 15569, "total": 16797},
  {"dev": 1411, "disel": 20283, "total": 21694},
  {"dev": 3005, "disel": 24644, "total": 27649},
  {"dev": 1044, "disel": 17872, "total": 18916},
  {"dev": 831, "disel": 15050, "total": 15881},
  {"dev": 1674, "disel": 23069, "total": 24743},
  {"dev": 1302, "disel": 21394, "total": 22696},
  {"dev": 2097, "disel": 23393, "total": 25490},
  {"dev": 3643, "disel": 25076, "total": 28719},
  {"dev": 2277, "disel": 25870, "total": 28147},
  {"dev": 2702, "disel": 23869, "total": 26571},
  {"dev": 6634, "disel": 28028, "total": 34662},
  {"dev": 1106, "disel": 19467, "total": 20573},
  {"dev": 1394, "disel": 21443, "total": 22837},
  {"dev": 2609, "disel": 44851, "total": 47460},
  {"dev": 4869, "disel": 17004, "total": 21873},
  {"dev": 3949, "disel": 20378, "total": 24327},
  {"dev": 8687, "disel": 27408, "total": 36095},
  {"dev": 2535, "disel": 14243, "total": 16778},
  {"dev": 4781, "disel": 15027, "total": 19808},
  {"dev": 7454, "disel": 15180, "total": 22634},
  {"dev": 4573, "disel": 15389, "total": 19962},
  {"dev": 5468, "disel": 15588, "total": 21056}
]

const startDate = DateTime.fromISO("2016-01-01")
const market = {
  country: 'Sweden',
  data: swedenOld.map((d, i) => ({
    x: startDate.plus({ month: i }),
    total: d.total,
    bev: d.dev,
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
