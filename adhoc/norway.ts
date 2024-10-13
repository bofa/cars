import { DateTime } from "luxon"
const fs = require('fs')

const old = [
  {"Date": "2013-01-01", "Total-BEV": 657, "Total-None-BEV": 11189, "Total": 11846},
  {"Date": "2013-02-01", "Total-BEV": 657, "Total-None-BEV": 11189, "Total": 11846},
  {"Date": "2013-03-01", "Total-BEV": 657, "Total-None-BEV": 11189, "Total": 11846},
  {"Date": "2013-04-01", "Total-BEV": 657, "Total-None-BEV": 11189, "Total": 11846},
  {"Date": "2013-05-01", "Total-BEV": 657, "Total-None-BEV": 11189, "Total": 11846},
  {"Date": "2013-06-01", "Total-BEV": 657, "Total-None-BEV": 11189, "Total": 11846},
  {"Date": "2013-07-01", "Total-BEV": 657, "Total-None-BEV": 11189, "Total": 11846},
  {"Date": "2013-08-01", "Total-BEV": 657, "Total-None-BEV": 11189, "Total": 11846},
  {"Date": "2013-09-01", "Total-BEV": 657, "Total-None-BEV": 11189, "Total": 11846},
  {"Date": "2013-10-01", "Total-BEV": 657, "Total-None-BEV": 11189, "Total": 11846},
  {"Date": "2013-11-01", "Total-BEV": 657, "Total-None-BEV": 11189, "Total": 11846},
  {"Date": "2013-12-01", "Total-BEV": 657, "Total-None-BEV": 11189, "Total": 11846},
  {"Date": "2014-01-01", "Total-BEV": 1508, "Total-None-BEV": 10509, "Total": 12017},
  {"Date": "2014-02-01", "Total-BEV": 1508, "Total-None-BEV": 10509, "Total": 12017},
  {"Date": "2014-03-01", "Total-BEV": 1508, "Total-None-BEV": 10509, "Total": 12017},
  {"Date": "2014-04-01", "Total-BEV": 1508, "Total-None-BEV": 10509, "Total": 12017},
  {"Date": "2014-05-01", "Total-BEV": 1508, "Total-None-BEV": 10509, "Total": 12017},
  {"Date": "2014-06-01", "Total-BEV": 1508, "Total-None-BEV": 10509, "Total": 12017},
  {"Date": "2014-07-01", "Total-BEV": 1508, "Total-None-BEV": 10509, "Total": 12017},
  {"Date": "2014-08-01", "Total-BEV": 1508, "Total-None-BEV": 10509, "Total": 12017},
  {"Date": "2014-09-01", "Total-BEV": 1508, "Total-None-BEV": 10509, "Total": 12017},
  {"Date": "2014-10-01", "Total-BEV": 1508, "Total-None-BEV": 10509, "Total": 12017},
  {"Date": "2014-11-01", "Total-BEV": 1508, "Total-None-BEV": 10509, "Total": 12017},
  {"Date": "2014-12-01", "Total-BEV": 1508, "Total-None-BEV": 10509, "Total": 12017},
  {"Date": "2015-01-01", "Total-BEV": 2149, "Total-None-BEV": 10408, "Total": 12557},
  {"Date": "2015-02-01", "Total-BEV": 2149, "Total-None-BEV": 10408, "Total": 12557},
  {"Date": "2015-03-01", "Total-BEV": 2149, "Total-None-BEV": 10408, "Total": 12557},
  {"Date": "2015-04-01", "Total-BEV": 2149, "Total-None-BEV": 10408, "Total": 12557},
  {"Date": "2015-05-01", "Total-BEV": 2149, "Total-None-BEV": 10408, "Total": 12557},
  {"Date": "2015-06-01", "Total-BEV": 2149, "Total-None-BEV": 10408, "Total": 12557},
  {"Date": "2015-07-01", "Total-BEV": 2149, "Total-None-BEV": 10408, "Total": 12557},
  {"Date": "2015-08-01", "Total-BEV": 2149, "Total-None-BEV": 10408, "Total": 12557},
  {"Date": "2015-09-01", "Total-BEV": 2149, "Total-None-BEV": 10408, "Total": 12557},
  {"Date": "2015-10-01", "Total-BEV": 2149, "Total-None-BEV": 10408, "Total": 12557},
  {"Date": "2015-11-01", "Total-BEV": 2149, "Total-None-BEV": 10408, "Total": 12557},
  {"Date": "2015-12-01", "Total-BEV": 2149, "Total-None-BEV": 10408, "Total": 12557},
  {"Date": "2016-01-01", "Total-BEV": 1906, "Total-None-BEV": 9085, "Total": 10991},
  {"Date": "2016-02-01", "Total-BEV": 1927, "Total-None-BEV": 10295, "Total": 12222},
  {"Date": "2016-03-01", "Total-BEV": 2597, "Total-None-BEV": 11278, "Total": 13875},
  {"Date": "2016-04-01", "Total-BEV": 1993, "Total-None-BEV": 12123, "Total": 14116},
  {"Date": "2016-05-01", "Total-BEV": 1423, "Total-None-BEV": 11441, "Total": 12864},
  {"Date": "2016-06-01", "Total-BEV": 1906, "Total-None-BEV": 11775, "Total": 13681},
  {"Date": "2016-07-01", "Total-BEV": 1103, "Total-None-BEV": 9937, "Total": 11040},
  {"Date": "2016-08-01", "Total-BEV": 2014, "Total-None-BEV": 11218, "Total": 13232},
  {"Date": "2016-09-01", "Total-BEV": 2629, "Total-None-BEV": 11225, "Total": 13854},
  {"Date": "2016-10-01", "Total-BEV": 1861, "Total-None-BEV": 10071, "Total": 11932},
  {"Date": "2016-11-01", "Total-BEV": 2567, "Total-None-BEV": 10627, "Total": 13194},
  {"Date": "2016-12-01", "Total-BEV": 2319, "Total-None-BEV": 11283, "Total": 13602},
  {"Date": "2017-01-01", "Total-BEV": 2349, "Total-None-BEV": 10706, "Total": 13055},
  {"Date": "2017-02-01", "Total-BEV": 1895, "Total-None-BEV": 9893, "Total": 11788},
  {"Date": "2017-03-01", "Total-BEV": 2936, "Total-None-BEV": 10462, "Total": 13398},
  {"Date": "2017-04-01", "Total-BEV": 1747, "Total-None-BEV": 9592, "Total": 11339},
  {"Date": "2017-05-01", "Total-BEV": 2211, "Total-None-BEV": 11964, "Total": 14175},
  {"Date": "2017-06-01", "Total-BEV": 4004, "Total-None-BEV": 10224, "Total": 14228},
  {"Date": "2017-07-01", "Total-BEV": 1842, "Total-None-BEV": 9634, "Total": 11476},
  {"Date": "2017-08-01", "Total-BEV": 2875, "Total-None-BEV": 10540, "Total": 13415},
  {"Date": "2017-09-01", "Total-BEV": 3925, "Total-None-BEV": 9559, "Total": 13484},
  {"Date": "2017-10-01", "Total-BEV": 2726, "Total-None-BEV": 9746, "Total": 12472},
  {"Date": "2017-11-01", "Total-BEV": 2796, "Total-None-BEV": 10947, "Total": 13743},
  {"Date": "2017-12-01", "Total-BEV": 4507, "Total-None-BEV": 11570, "Total": 16077},
  {"Date": "2018-01-01", "Total-BEV": 2128, "Total-None-BEV": 8473, "Total": 10601},
  {"Date": "2018-02-01", "Total-BEV": 2200, "Total-None-BEV": 7991, "Total": 10191},
  {"Date": "2018-03-01", "Total-BEV": 5366, "Total-None-BEV": 10481, "Total": 15847},
  {"Date": "2018-04-01", "Total-BEV": 4540, "Total-None-BEV": 11238, "Total": 15778},
  {"Date": "2018-05-01", "Total-BEV": 3939, "Total-None-BEV": 11030, "Total": 14969},
  {"Date": "2018-06-01", "Total-BEV": 5046, "Total-None-BEV": 13074, "Total": 18120},
  {"Date": "2018-07-01", "Total-BEV": 3101, "Total-None-BEV": 8308, "Total": 11409},
  {"Date": "2018-08-01", "Total-BEV": 5555, "Total-None-BEV": 11341, "Total": 16896},
  {"Date": "2018-09-01", "Total-BEV": 6062, "Total-None-BEV": 6630, "Total": 12692},
  {"Date": "2018-10-01", "Total-BEV": 5595, "Total-None-BEV": 8021, "Total": 13616},
  {"Date": "2018-11-01", "Total-BEV": 6196, "Total-None-BEV": 8042, "Total": 14238},
  {"Date": "2018-12-01", "Total-BEV": 5717, "Total-None-BEV": 7855, "Total": 13572},
  {"Date": "2019-01-01", "Total-BEV": 4196, "Total-None-BEV": 6148, "Total": 10344},
  {"Date": "2019-02-01", "Total-BEV": 5083, "Total-None-BEV": 7218, "Total": 12301},
  {"Date": "2019-03-01", "Total-BEV": 11364, "Total-None-BEV": 8358, "Total": 19722},
  {"Date": "2019-04-01", "Total-BEV": 4997, "Total-None-BEV": 7510, "Total": 12507},
  {"Date": "2019-05-01", "Total-BEV": 5290, "Total-None-BEV": 9353, "Total": 14643},
  {"Date": "2019-06-01", "Total-BEV": 7995, "Total-None-BEV": 8737, "Total": 16732},
  {"Date": "2019-07-01", "Total-BEV": 4006, "Total-None-BEV": 6758, "Total": 10764},
  {"Date": "2019-08-01", "Total-BEV": 5361, "Total-None-BEV": 8321, "Total": 13682},
  {"Date": "2019-09-01", "Total-BEV": 6664, "Total-None-BEV": 5841, "Total": 12505},
  {"Date": "2019-10-01", "Total-BEV": 4350, "Total-None-BEV": 7377, "Total": 11727},
  {"Date": "2019-11-01", "Total-BEV": 4136, "Total-None-BEV": 6851, "Total": 10987},
  {"Date": "2019-12-01", "Total-BEV": 3699, "Total-None-BEV": 8236, "Total": 11935},
  {"Date": "2020-01-01", "Total-BEV": 4497, "Total-None-BEV": 5911, "Total": 10408},
  {"Date": "2020-02-01", "Total-BEV": 5347, "Total-None-BEV": 5885, "Total": 11232},
  {"Date": "2020-03-01", "Total-BEV": 7164, "Total-None-BEV": 6000, "Total": 13164},
  {"Date": "2020-04-01", "Total-BEV": 3792, "Total-None-BEV": 4231, "Total": 8023},
  {"Date": "2020-05-01", "Total-BEV": 3555, "Total-None-BEV": 5396, "Total": 8951},
  {"Date": "2020-06-01", "Total-BEV": 5253, "Total-None-BEV": 7248, "Total": 12501},
  {"Date": "2020-07-01", "Total-BEV": 4506, "Total-None-BEV": 6610, "Total": 11116},
  {"Date": "2020-08-01", "Total-BEV": 5822, "Total-None-BEV": 6412, "Total": 12234},
  {"Date": "2020-09-01", "Total-BEV": 9875, "Total-None-BEV": 7119, "Total": 16994},
  {"Date": "2020-10-01", "Total-BEV": 8241, "Total-None-BEV": 5967, "Total": 14208},
  {"Date": "2020-11-01", "Total-BEV": 7443, "Total-None-BEV": 6134, "Total": 13577},
  {"Date": "2020-12-01", "Total-BEV": 14090, "Total-None-BEV": 7345, "Total": 21435},
  {"Date": "2021-01-01", "Total-BEV": 5948, "Total-None-BEV": 5206, "Total": 11154},
  {"Date": "2021-02-01", "Total-BEV": 5487, "Total-None-BEV": 6276, "Total": 11763},
  {"Date": "2021-03-01", "Total-BEV": 9191, "Total-None-BEV": 7527, "Total": 16718},
  {"Date": "2021-04-01", "Total-BEV": 7903, "Total-None-BEV": 6782, "Total": 14685},
  {"Date": "2021-05-01", "Total-BEV": 9134, "Total-None-BEV": 6460, "Total": 15594},
  {"Date": "2021-06-01", "Total-BEV": 13666, "Total-None-BEV": 8639, "Total": 22305},
  {"Date": "2021-07-01", "Total-BEV": 6931, "Total-None-BEV": 5381, "Total": 12312},
  {"Date": "2021-08-01", "Total-BEV": 12297, "Total-None-BEV": 4130, "Total": 16427},
  {"Date": "2021-09-01", "Total-BEV": 14367, "Total-None-BEV": 3625, "Total": 17992},
  {"Date": "2021-10-01", "Total-BEV": 8462, "Total-None-BEV": 3117, "Total": 11579},
  {"Date": "2021-11-01", "Total-BEV": 11701, "Total-None-BEV": 3573, "Total": 15274},
  {"Date": "2021-12-01", "Total-BEV": 14160, "Total-None-BEV": 6407, "Total": 20567}
]

const market = {
  country: 'Norway',
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
