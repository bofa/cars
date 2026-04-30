import { sum } from 'mathjs'
import { DateTime } from 'luxon'
import { readPdf } from "../read-pdf"
const fs = require('fs')

// Source
// https://www.acea.auto/nav/?content=press-releases&tag=registrations-of-vehicles

const files = [
  // { date: '2023-01-01', file: './acea_commercial/2023Q1.pdf' },
  // { date: '2023-04-01', file: './acea_commercial/2023Q2.pdf' },
  // { date: '2023-07-01', file: './acea_commercial/2023Q3.pdf' },
  // { date: '2023-10-01', file: './acea_commercial/2023Q4.pdf' },

  // { date: '2024-01-01', file: './acea_commercial/2024Q1.pdf' },
  // { date: '2024-04-01', file: './acea_commercial/2024Q2.pdf' },
  // { date: '2024-07-01', file: './acea_commercial/2024Q3.pdf' },
  // { date: '2024-10-01', file: './acea_commercial/2024Q4.pdf' },

  // { date: '2025-01-01', file: './acea_commercial/2025Q1.pdf' },
  // { date: '2025-04-01', file: './acea_commercial/2025Q2.pdf' },
  // { date: '2025-07-01', file: './acea_commercial/2025Q3.pdf' },
  // { date: '2025-10-01', file: './acea_commercial/2025Q4.pdf' },
  { date: '2026-01-01', file: './acea_commercial/2026Q1.pdf' },

]

const countries = [
  "Austria",
  "Belgium", 
  // "Bulgaria",
  "Croatia", 
  "Cyprus", 
  "Czechia",
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
  // "Malta", 
  "Netherlands", 
  "Poland", 
  "Portugal", 
  // "Romania",
  "Slovenia", 
  "Spain",
  "Sweden",
  "Iceland",
  "Norway",
  "Switzerland",
  "United Kingdom",

  // "Czech Republic",
]

const categories = [
  { label: 'heavytrucks', search: [
    'HEAVY',
    'NEW HEAVY TRUCK',
    'NEWHEAVYTRUCKREGISTRATIONS',
    // 'TRUCK'
  ] },
  { label: 'van', search: ['NEW VAN'] },
  { label: 'mediumtrucks', search: ['NEW MEDIUM TRUCK'] },
  { label: 'busses', search: ['NEW BUS', 'TOTAL NEW BUS'] },
]

const rowOffset = 22

files
.forEach(({ date, file }) => {
  readPdf(file).then(result => {
    categories
    .forEach(category => countries.forEach((startString) => {
      // console.log('starts With new', result.filter(s => s.includes('HEAVY')))
      const monthlyIndex = result.findIndex(s => category.search.some(c => s.startsWith(c)))
      const startIndex = result.slice(monthlyIndex).findIndex(s => s === startString, monthlyIndex) + monthlyIndex

      // console.log('monthlyIndex', monthlyIndex, startIndex)
      // const endTableIndex = result.findIndex(s => s === endString) - 1

      const baseSlice = result.slice(startIndex, startIndex + rowOffset)

      const countrySegment = baseSlice
      // +- should be follow by a .
      .reduce((input, value, i, a) => {
        if (/^(?!.*[+-](?!.*\.))[\s\S]*$/.test(a[i-1])) {
          return input.concat(value)
        }

        const output = input.map(v => v)
        output[output.length-1] = input.at(-1) + value
        return output
      }, [] as string[])
      // Comma should be follow by three numbers
      .reduce((input, value, i, a) => {
        if (/^(?:[^,]*|[^,]*,(?=\d{3}\b)[^,]*)*$/.test(a[i-1])) {
          return input.concat(value)
        }

        const output = input.map(v => v)
        output[output.length-1] = input.at(-1) + value
        return output
      }, [] as string[])
      // Join cells starting with ',' or '.'
      .reduce((input, value, i) => {
        if (value[0] !== ',' && value[0] !== '.' && value.slice(0, 2) !== '0,') {
          return input.concat(value)
        }

        const output = input.map(v => v)
        output[output.length-1] = input.at(-1) + value
        return output
      }, [] as string[])
      // Zero/zero append % change
      .reduce((input, value) => {
        if (value === '0' && input.at(-1) === '0' ) {
          return input.concat([value, '+0.0'])
        }

        return input.concat(value)
      }, [] as string[])
      .slice(1, 20)
      .filter((v, i) => i%3 !== 2)

      if (countrySegment.some(v => v.includes('+') || v.includes('-'))) {
        console.log('Broken', startString)
        console.log(baseSlice.slice(1).map(v => v.padEnd(6,' ')).join('|'))
        console.log(countrySegment.map(v => v.padEnd(6,' ')).join('|'))
        return
      }

      const valueSum = sum(countrySegment.filter((v, i) => [0, 2, 4, 6, 8].includes(i))
        .filter(v => v !== null)
        .map(toNumber)
      )
      const total = toNumber(countrySegment[10])
      
      if (valueSum !== total) {
        console.log('Sum error', startString, startString, valueSum - total, valueSum, total)
        console.log(baseSlice.slice(1).map(v => v.padEnd(6,' ')).join('|'))
        console.log(countrySegment.map(v => v.padEnd(6,' ')).join('|'))

        return
      }

      console.log('Working', startString)

      const index = 0
      const market = {
        country: startString,
        data: [
          {
            x: DateTime.fromISO(date, { zone: 'utc' }),
            bev: toNumber(countrySegment[index+0]),
            phev: toNumber(countrySegment[index+2]),
            hybrid: null,
            // hybrid: toNumber(countrySegment[index+5]),
            other: toNumber(countrySegment[index+4]),
            petrol: toNumber(countrySegment[index+6]),
            disel: toNumber(countrySegment[index+8]),
            total: toNumber(countrySegment[index+10]),
          },
          {
            x: DateTime.fromISO(date, { zone: 'utc' }).minus({ year: 1 }),
            bev: toNumber(countrySegment[index+1]),
            phev: toNumber(countrySegment[index+3]),
            hybrid: null,
            // hybrid: toNumber(countrySegment[index+6]),
            other: toNumber(countrySegment[index+5]),
            petrol: toNumber(countrySegment[index+7]),
            disel: toNumber(countrySegment[index+9]),
            total: toNumber(countrySegment[index+11]),
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

        if (unique.filter(el => isNaN(el.bev)).length > unique.length/3) {
          console.warn('Lots of null', market.country, category.label)
        } else {
          fs.writeFileSync(filename, JSON.stringify(unique, null, 2))
        }
        // console.log(countries)
      }))
    // })
  })
})

function toNumber(s: string) {
  return Number(s?.replace(',', '').replace('.', ''))
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

