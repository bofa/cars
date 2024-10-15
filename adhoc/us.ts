import { DateTime } from "luxon"
const fs = require('fs')

const country = "United States"
const old = [
  {"date": "2017-01-01", "bev": 5398, "phev": 5669, "hybrid": 22630, "total": 1142568},
  {"date": "2017-02-01", "bev": 5846, "phev": 6247, "hybrid": 28355, "total": 1333128},
  {"date": "2017-03-01", "bev": 10171, "phev": 7384, "hybrid": 32012, "total": 1554998},
  {"date": "2017-04-01", "bev": 5961, "phev": 7300, "hybrid": 30949, "total": 1426883},
  {"date": "2017-05-01", "bev": 8038, "phev": 8645, "hybrid": 33729, "total": 1519793},
  {"date": "2017-06-01", "bev": 8814, "phev": 7787, "hybrid": 30073, "total": 1474970},
  {"date": "2017-07-01", "bev": 7802, "phev": 7407, "hybrid": 29050, "total": 1416743},
  {"date": "2017-08-01", "bev": 8850, "phev": 7668, "hybrid": 34850, "total": 1484826},
  {"date": "2017-09-01", "bev": 13421, "phev": 7719, "hybrid": 37319, "total": 1525522},
  {"date": "2017-10-01", "bev": 6792, "phev": 6665, "hybrid": 29451, "total": 1356789},
  {"date": "2017-11-01", "bev": 8435, "phev": 8408, "hybrid": 30075, "total": 1399640},
  {"date": "2017-12-01", "bev": 14959, "phev": 10289, "hybrid": 32187, "total": 1605527},
  {"date": "2018-01-01", "bev": 9154, "phev": 6241, "hybrid": 21718, "total": 1151011},
  {"date": "2018-02-01", "bev": 6653, "phev": 8783, "hybrid": 24609, "total": 1293763},
  {"date": "2018-03-01", "bev": 11060, "phev": 11601, "hybrid": 28165, "total": 1647090},
  {"date": "2018-04-01", "bev": 12794, "phev": 9931, "hybrid": 24827, "total": 1353546},
  {"date": "2018-05-01", "bev": 12232, "phev": 11403, "hybrid": 31602, "total": 1586493},
  {"date": "2018-06-01", "bev": 12997, "phev": 10485, "hybrid": 31038, "total": 1543716},
  {"date": "2018-07-01", "bev": 15387, "phev": 9269, "hybrid": 28203, "total": 1362964},
  {"date": "2018-08-01", "bev": 20222, "phev": 10132, "hybrid": 30182, "total": 1482215},
  {"date": "2018-09-01", "bev": 24163, "phev": 10777, "hybrid": 31985, "total": 1432136},
  {"date": "2018-10-01", "bev": 29937, "phev": 9937, "hybrid": 28614, "total": 1360281},
  {"date": "2018-11-01", "bev": 24089, "phev": 11580, "hybrid": 27453, "total": 1382553},
  {"date": "2018-12-01", "bev": 28374, "phev": 13744, "hybrid": 29753, "total": 1617778},
  {"date": "2019-01-01", "bev": 26942, "phev": 6010, "hybrid": 19153, "total": 1133157},
  {"date": "2019-02-01", "bev": 10644, "phev": 6610, "hybrid": 22730, "total": 1251513},
  {"date": "2019-03-01", "bev": 17281, "phev": 8074, "hybrid": 30926, "total": 1598811},
  {"date": "2019-04-01", "bev": 20113, "phev": 5908, "hybrid": 33082, "total": 1326555},
  {"date": "2019-05-01", "bev": 18012, "phev": 7949, "hybrid": 44162, "total": 1581479},
  {"date": "2019-06-01", "bev": 23421, "phev": 7999, "hybrid": 39247, "total": 1509674},
  {"date": "2019-07-01", "bev": 23559, "phev": 7197, "hybrid": 36341, "total": 1396460},
  {"date": "2019-08-01", "bev": 18864, "phev": 8433, "hybrid": 42830, "total": 1638722},
  {"date": "2019-09-01", "bev": 21812, "phev": 5816, "hybrid": 29848, "total": 1267150},
  {"date": "2019-10-01", "bev": 23072, "phev": 6388, "hybrid": 32457, "total": 1333995},
  {"date": "2019-11-01", "bev": 11421, "phev": 7733, "hybrid": 32962, "total": 1403153},
  {"date": "2019-12-01", "bev": 18681, "phev": 7674, "hybrid": 35706, "total": 1512243},
  {"date": "2020-01-01", "bev": 26391, "phev": 5104, "hybrid": 27166, "total": 1136560},
  {"date": "2020-02-01", "bev": 11151, "phev": 6111, "hybrid": 32309, "total": 1350570},
  {"date": "2020-03-01", "bev": 18234, "phev": 3481, "hybrid": 23591, "total": 989954},
  {"date": "2020-04-01", "bev": 8058, "phev": 2015, "hybrid": 14268, "total": 715322},
  {"date": "2020-05-01", "bev": 8626, "phev": 3911, "hybrid": 27740, "total": 1119089},
  {"date": "2020-06-01", "bev": 16809, "phev": 4206, "hybrid": 41590, "total": 1101169},
  {"date": "2020-07-01", "bev": 23075, "phev": 5228, "hybrid": 43738, "total": 1236643},
  {"date": "2020-08-01", "bev": 17291, "phev": 6478, "hybrid": 42191, "total": 1318070},
  {"date": "2020-09-01", "bev": 28101, "phev": 6670, "hybrid": 43293, "total": 1341099},
  {"date": "2020-10-01", "bev": 29959, "phev": 7755, "hybrid": 47611, "total": 1358922},
  {"date": "2020-11-01", "bev": 22225, "phev": 7369, "hybrid": 47724, "total": 1199137},
  {"date": "2020-12-01", "bev": 28620, "phev": 10721, "hybrid": 63846, "total": 1605497},
  {"date": "2021-01-01", "bev": 25103, "phev": 7463, "hybrid": 46843, "total": 1106286},
  {"date": "2021-02-01", "bev": 26215, "phev": 9046, "hybrid": 54045, "total": 1193776},
  {"date": "2021-03-01", "bev": 40755, "phev": 12261, "hybrid": 78123, "total": 1597152},
  {"date": "2021-04-01", "bev": 33547, "phev": 18604, "hybrid": 76397, "total": 1518415},
  {"date": "2021-05-01", "bev": 29796, "phev": 20807, "hybrid": 82511, "total": 1570313},
  {"date": "2021-06-01", "bev": 45913, "phev": 16648, "hybrid": 65960, "total": 1302213},
  {"date": "2021-07-01", "bev": 42013, "phev": 15669, "hybrid": 74298, "total": 1280803},
  {"date": "2021-08-01", "bev": 35499, "phev": 14067, "hybrid": 67976, "total": 1092661},
  {"date": "2021-09-01", "bev": 42020, "phev": 12554, "hybrid": 60102, "total": 1015935},
  {"date": "2021-10-01", "bev": 42485, "phev": 18275, "hybrid": 63482, "total": 1051015},
  {"date": "2021-11-01", "bev": 46687, "phev": 14170, "hybrid": 59326, "total": 1014411},
  {"date": "2021-12-01", "bev": 49441, "phev": 16553, "hybrid": 69983, "total": 1203993},
  {"date": "2022-01-01", "bev": 42780, "phev": 11983, "hybrid": 63093, "total": 991573},
  {"date": "2022-02-01", "bev": 46859, "phev": 12563, "hybrid": 58175, "total": 1045624},
  {"date": "2022-03-01", "bev": 64160, "phev": 16200, "hybrid": 76683, "total": 1257821},
  {"date": "2022-04-01", "bev": 52537, "phev": 17875, "hybrid": 71849, "total": 1236432},
  {"date": "2022-05-01", "bev": 52502, "phev": 15263, "hybrid": 68737, "total": 1108063},
  {"date": "2022-06-01", "bev": 74262, "phev": 14838, "hybrid": 61039, "total": 1143820},
  {"date": "2022-07-01", "bev": 64310, "phev": 13932, "hybrid": 59229, "total": 1126523},
  {"date": "2022-08-01", "bev": 59836, "phev": 13797, "hybrid": 58869, "total": 1134265},
  {"date": "2022-09-01", "bev": 69811, "phev": 13415, "hybrid": 55892, "total": 1124297},
  {"date": "2022-10-01", "bev": 71739, "phev": 17603, "hybrid": 66661, "total": 1181540},
  {"date": "2022-11-01", "bev": 69924, "phev": 16183, "hybrid": 57086, "total": 1135484},
  {"date": "2022-12-01", "bev": 79262, "phev": 19759, "hybrid": 69099, "total": 1268897},
  {"date": "2023-01-01", "bev": 72944, "phev": 15593, "hybrid": 60069, "total": 1046919},
  {"date": "2023-02-01", "bev": 81158, "phev": 17789, "hybrid": 66320, "total": 1138756},
  {"date": "2023-03-01", "bev": 92077, "phev": 21397, "hybrid": 94289, "total": 1374992},
  {"date": "2023-04-01", "bev": 92880, "phev": 24165, "hybrid": 100528, "total": 1357844},
  {"date": "2023-05-01", "bev": 95898, "phev": 25125, "hybrid": 103832, "total": 1363818},
  {"date": "2023-06-01", "bev": 102525, "phev": 22560, "hybrid": 100762, "total": 1368713},
  {"date": "2023-07-01", "bev": 101234, "phev": 23194, "hybrid": 103757, "total": 1299271},
  {"date": "2023-08-01", "bev": 96091, "phev": 27497, "hybrid": 107325, "total": 1318588},
  {"date": "2023-09-01", "bev": 113383, "phev": 28807, "hybrid": 109228, "total": 1340980},
  {"date": "2023-10-01", "bev": 90509, "phev": 22037, "hybrid": 103799, "total": 1193974},
  {"date": "2023-11-01", "bev": 102323, "phev": 24530, "hybrid": 108549, "total": 1235583},
  {"date": "2023-12-01", "bev": 121647, "phev": 41121, "hybrid": 117098, "total": 1458853},
  {"date": "2024-01-01", "bev": 81317, "phev": 25759, "hybrid": 91929, "total": 1066907},
  {"date": "2024-02-01", "bev": 80715, "phev": 28610, "hybrid": 105919, "total": 1239614},
  {"date": "2024-03-01", "bev": 93468, "phev": 35187, "hybrid": 123870, "total": 1436680},
  {"date": "2024-04-01", "bev": 96295, "phev": 28297, "hybrid": 118822, "total": 1322031},
  {"date": "2024-05-01", "bev": 104754, "phev": 28939, "hybrid": 139053, "total": 1436802},
  {"date": "2024-06-01", "bev": 100589, "phev": 22338, "hybrid": 135609, "total": 1312289},
  {"date": "2024-07-01", "bev": 113772, "phev": 22974, "hybrid": 134074, "total": 1288469},
  {"date": "2024-08-01", "bev": 125971, "phev": 25747, "hybrid": 150626, "total": 1424239},
  {"date": "2024-09-01", "bev": 104343, "phev": 18430, "hybrid": 123864, "total": 1169908}
]

  
const market = {
  country,
  data: old.map((d, i) => ({
    x: DateTime.fromISO(d.date),
    bev: d.bev,
    phev: d.phev,
    hybrid: d.hybrid,
    other: null,
    petrol: null,
    disel: null,
    total: d.total,
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
