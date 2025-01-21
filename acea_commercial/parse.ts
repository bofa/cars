import { DateTime } from 'luxon'
import { readPdf } from "../read-pdf"
const fs = require('fs')

const files = [
  // { date: '2023-01-01', file: './acea_commercial/2023Q1.pdf' },
  // { date: '2023-04-01', file: './acea_commercial/2023Q2.pdf' },
  // { date: '2023-07-01', file: './acea_commercial/2023Q3.pdf' },
  // { date: '2023-10-01', file: './acea_commercial/2023Q4.pdf' },

  { date: '2024-01-01', file: './acea_commercial/2024Q1.pdf' },
  { date: '2024-04-01', file: './acea_commercial/2024Q2.pdf' },
  { date: '2024-07-01', file: './acea_commercial/2024Q3.pdf' },
  // { date: '2024-10-01', file: './acea_commercial/2024Q4.pdf' },
]

const countries = [
  // "Austria", 
  "Belgium", 
  // "Bulgaria", 
  "Croatia", 
  "Cyprus", 
  // "Czechia",
  // "Czech Republic",
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
  // "Lithuania", 
  "Luxembourg",
  // "Malta", 
  "Netherlands", 
  "Poland", 
  "Portugal", 
  // "Romania", 
  "Slovenia", 
  // "Spain", 
  "Sweden",
  "Iceland",
  "Norway",
  "Switzerland",
  "United Kingdom",
]

const categories = [
  { label: 'van', search: ['NEW VAN'] },
  { label: 'mediumtrucks', search: ['NEW MEDIUM TRUCK'] },
  { label: 'heavytrucks', search: ['NEW HEAVY TRUCK'] },
  { label: 'busses', search: ['NEW BUS', 'TOTAL NEW BUS'] },
]

const rowOffset = 22

files.forEach(({ date, file }) => {
  readPdf(file).then(result => {

    categories.forEach(category => countries.forEach((startString) => {
      // console.log('starts With new', result.filter(s => s.includes('BUS')))
      const monthlyIndex = result.findIndex(s => category.search.some(c => c === s))
      const startIndex = result.slice(monthlyIndex).findIndex(s => s === startString, monthlyIndex)
        + monthlyIndex
      console.log('monthlyIndex', monthlyIndex, startIndex)
      // const endTableIndex = result.findIndex(s => s === endString) - 1
      
      const countrySegment = result.slice(startIndex, startIndex + rowOffset)
        .filter(s => !((s.includes('+') || s.includes('-') || s.includes('!'))))
        .filter((s, i) => i === 0 || !isFirstCharLetter(s)) //  && (Number(s.slice(1, 2)) > 0)))

      console.log(countrySegment[0], countrySegment.length)
      // if (countrySegment.length < )

      // console.log('countrySegment', result.slice(startIndex, startIndex + rowOffset), countrySegment)

      const index = 0
      const market = {
        country: countrySegment[index],
        data: [
          {
            x: DateTime.fromISO(date, { zone: 'utc' }),
            bev: toNumber(countrySegment[index+1]),
            phev: toNumber(countrySegment[index+3]),
            hybrid: null,
            // hybrid: toNumber(countrySegment[index+5]),
            other: toNumber(countrySegment[index+5]),
            petrol: toNumber(countrySegment[index+7]),
            disel: toNumber(countrySegment[index+9]),
            total: toNumber(countrySegment[index+11]),
          },
          {
            x: DateTime.fromISO(date, { zone: 'utc' }).minus({ year: 1 }),
            bev: toNumber(countrySegment[index+2]),
            phev: toNumber(countrySegment[index+4]),
            hybrid: null,
            // hybrid: toNumber(countrySegment[index+6]),
            other: toNumber(countrySegment[index+6]),
            petrol: toNumber(countrySegment[index+8]),
            disel: toNumber(countrySegment[index+10]),
            total: toNumber(countrySegment[index+12]),
          },
        ]
      }

      // console.log('countries', countries)

      // Export data
      // countries.forEach(market => {
        const filename = `./acea_commercial/process/${category.label}-${market.country}.json`
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

        fs.writeFileSync(filename, JSON.stringify(unique, null, 2).replace(/\n/g, '\r\n'))
        // console.log(countries)
      }))
    // })
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

function isFirstCharLetter(str: string): boolean {
  return /^[a-zA-Z]/.test(str);
}

