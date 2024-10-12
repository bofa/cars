import { PdfReader } from "pdfreader"
import { DateTime } from 'luxon'
const fs = require('fs')

const files = [
  { date: '2023-01-01', file: './acea/2023-01.pdf' },
  { date: '2023-02-01', file: './acea/2023-02.pdf' },
  { date: '2023-03-01', file: './acea/2023-03.pdf' },
  { date: '2023-04-01', file: './acea/2023-04.pdf' },
  { date: '2023-05-01', file: './acea/2023-05.pdf' },
  { date: '2023-06-01', file: './acea/2023-06.pdf' },
  { date: '2023-07-01', file: './acea/2023-07.pdf' },
  { date: '2023-08-01', file: './acea/2023-08.pdf' },
  { date: '2023-09-01', file: './acea/2023-09.pdf' },
  { date: '2023-10-01', file: './acea/2023-10.pdf' },
  { date: '2023-11-01', file: './acea/2023-11.pdf' },
  { date: '2023-12-01', file: './acea/2023-12.pdf' },

  { date: '2024-01-01', file: './acea/2024-01.pdf' },
  { date: '2024-02-01', file: './acea/2024-02.pdf' },
  { date: '2024-03-01', file: './acea/2024-03.pdf' },
  { date: '2024-04-01', file: './acea/2024-04.pdf' },
  { date: '2024-05-01', file: './acea/2024-05.pdf' },
  { date: '2024-06-01', file: './acea/2024-06.pdf' },
  { date: '2024-07-01', file: './acea/2024-07.pdf' },
  { date: '2024-08-01', file: './acea/2024-08.pdf' },
]

const rowOffset = 22

files.forEach(({ date, file }) => {
  const result: any[] = []
  new PdfReader().parseFileItems(file, (err, item) => {
    if (err) console.error("error:", err)
    else if (item?.text) {
      // console.log('item', item)
      result.push(item.text ?? '?')
    }
    else if (!item) {
      // [
      //   // ['Austria', 'EUROPEAN UNION'],
      //   ['Austria', 'Bulgaria'],
      //   ['Sweden', 'EUROPEAN UNION'],
      //   // ['Iceland', 'EFTA'],
      //   // ['United Kingdom', 'EU + EFTA + UK']
      // ]
      // getPairwise(countries)
      [
        "Austria", 
        "Belgium", 
        "Bulgaria", 
        "Croatia", 
        "Cyprus", 
        "Czechia",
        "Czech Republic",
        "Denmark", 
        "Estonia", 
        "Finland", 
        "France", 
        "Germany", 
        "Greece", 
        "Hungary", 
        "Ireland", 
        "Italy", 
        "Latvia", 
        "Lithuania", 
        "Luxembourg",
        "Malta", 
        "Netherlands", 
        "Poland", 
        "Portugal", 
        "Romania", 
        "Slovenia", 
        "Spain", 
        "Sweden",
        "Iceland",
        "Norway",
        "Switzerland",
        "United Kingdom",
      ]
      .forEach((startString) => {
        const startIndex = result.findIndex(s => s === startString)
        // const endTableIndex = result.findIndex(s => s === endString) - 1
        
        const countrySegment = result.slice(startIndex, startIndex + rowOffset)
          .filter(s => !((s.includes('+') || s.includes('-'))))
          .filter((s, i) => i === 0 || !isFirstCharLetter(s)) //  && (Number(s.slice(1, 2)) > 0)))

        console.log(countrySegment[0], countrySegment.length)
        // if (countrySegment.length < )



        console.log('countrySegment', result.slice(startIndex, startIndex + rowOffset), countrySegment)

        const index = 0
        const market = {
          country: countrySegment[index],
          data: [
            {
              x: DateTime.fromISO(date),
              bev: toNumber(countrySegment[index+1]),
              phev: toNumber(countrySegment[index+3]),
              hybrid: toNumber(countrySegment[index+5]),
              other: toNumber(countrySegment[index+7]),
              petrol: toNumber(countrySegment[index+9]),
              disel: toNumber(countrySegment[index+11]),
              total: toNumber(countrySegment[index+13]),
            },
            {
              x: DateTime.fromISO(date).minus({ year: 1 }),
              bev: toNumber(countrySegment[index+2]),
              phev: toNumber(countrySegment[index+4]),
              hybrid: toNumber(countrySegment[index+6]),
              other: toNumber(countrySegment[index+8]),
              petrol: toNumber(countrySegment[index+10]),
              disel: toNumber(countrySegment[index+12]),
              total: toNumber(countrySegment[index+14]),
            }
          ]
        }

        // console.log('countries', countries)

        // Export data
        // countries.forEach(market => {
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
          // console.log(countries)
        })
      // })
    }
  })
})

function toNumber(s: string) {
  return Number(s?.replace(',', ''))
}

function uniq<T extends Record<string, any>>(array: T[], key: keyof T) {
  let seen: any = {}
  return array.filter(function(item) {
    return seen.hasOwnProperty(item[key]) ? false : (seen[item[key]] = true)
  })
}

function getPairwise<T>(arr: T[]): [T, T][] {
  const pairs: [T, T][] = [];

  for (let i = 0; i < arr.length - 1; i++) {
    pairs.push([arr[i], arr[i+1]]);
  }

  return pairs;
}

function isFirstCharLetter(str: string): boolean {
  return /^[a-zA-Z]/.test(str);
}

