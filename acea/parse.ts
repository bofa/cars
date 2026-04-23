import { sum } from 'mathjs'
import { readPdf } from '../read-pdf'
import { DateTime } from 'luxon'
const fs = require('fs')

// Sources
// Europe https://www.acea.auto/nav/?content=press-releases
// USA https://www.anl.gov/esia/reference/light-duty-electric-drive-vehicles-monthly-sales-updates-historical-data
// China https://tradingeconomics.com/china/electric-car-registrations
// China https://tradingeconomics.com/china/car-registrations

const files = [
  // { date: '2023-01-01', file: './acea/2023-01.pdf' },
  // { date: '2023-02-01', file: './acea/2023-02.pdf' },
  // { date: '2023-03-01', file: './acea/2023-03.pdf' },
  // { date: '2023-04-01', file: './acea/2023-04.pdf' },
  // { date: '2023-05-01', file: './acea/2023-05.pdf' },
  // { date: '2023-06-01', file: './acea/2023-06.pdf' },
  // { date: '2023-07-01', file: './acea/2023-07.pdf' },
  // { date: '2023-08-01', file: './acea/2023-08.pdf' },
  // { date: '2023-09-01', file: './acea/2023-09.pdf' },
  // { date: '2023-10-01', file: './acea/2023-10.pdf' },
  // { date: '2023-11-01', file: './acea/2023-11.pdf' },
  // { date: '2023-12-01', file: './acea/2023-12.pdf' },

  // { date: '2024-01-01', file: './acea/2024-01.pdf' },
  // { date: '2024-02-01', file: './acea/2024-02.pdf' },
  // { date: '2024-03-01', file: './acea/2024-03.pdf' },
  // { date: '2024-04-01', file: './acea/2024-04.pdf' },
  // { date: '2024-05-01', file: './acea/2024-05.pdf' },
  // { date: '2024-06-01', file: './acea/2024-06.pdf' },
  // { date: '2024-07-01', file: './acea/2024-07.pdf' },
  // { date: '2024-08-01', file: './acea/2024-08.pdf' },
  // { date: '2024-09-01', file: './acea/2024-09.pdf' },
  // { date: '2024-10-01', file: './acea/2024-10.pdf' },
  // { date: '2024-11-01', file: './acea/2024-11.pdf' },
  // { date: '2024-12-01', file: './acea/2024-12.pdf' },
  // { date: '2025-01-01', file: './acea/2025-01.pdf' },
  // { date: '2025-02-01', file: './acea/2025-02.pdf' },
  // { date: '2025-03-01', file: './acea/2025-03.pdf' },
  // { date: '2025-04-01', file: './acea/2025-04.pdf' },
  // { date: '2025-05-01', file: './acea/2025-05.pdf' },
  // { date: '2025-06-01', file: './acea/2025-06.pdf' },
  // { date: '2025-07-01', file: './acea/2025-07.pdf' },
  // { date: '2025-08-01', file: './acea/2025-08.pdf' },
  // { date: '2025-09-01', file: './acea/2025-09.pdf' },
  // { date: '2025-10-01', file: './acea/2025-10.pdf' },
  // { date: '2025-11-01', file: './acea/2025-11.pdf' },
  // { date: '2025-12-01', file: './acea/2025-12.pdf' },
  // { date: '2026-01-01', file: './acea/2026-01.pdf' },
  // { date: '2026-02-01', file: './acea/2026-02.pdf' },
  { date: '2026-03-01', file: './acea/2026-03.pdf' },
  // { date: '2026-04-01', file: './acea/2026-04.pdf' },
  // { date: '2026-05-01', file: './acea/2026-05.pdf' },
]

const rowOffset = 22

files.forEach(({ date, file }) => {
  readPdf(file).then(result => {

    [
      "Austria", 
      "Belgium", 
      "Bulgaria", 
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

      // "Czech Republic",
    ]
    .forEach((startString) => {
      // console.log('result', result.filter(s => s.startsWith('NEW')))
      const monthlyIndex = result.findIndex(s => false
        || s === 'MONTHLY'
        // || s === 'NEW PASSENGER CAR REGISTRATIONS, BY MARKET AND FUEL TYPE '
        // || s === 'NEW PASSENGER CAR REGISTRATIONS BY MARKET AND FUEL TYPE '
        // || s === 'NEW CAR REGISTRATIONS BY MARKET AND POWER SOURCE'
        // || s === 'YEAR TO DATE'
      )
      const startIndex = result.slice(monthlyIndex).findIndex(s => s === startString, monthlyIndex)
        + monthlyIndex
      // console.log('monthlyIndex', monthlyIndex, startIndex)
      // const endTableIndex = result.findIndex(s => s === endString) - 1

      const baseSlice = result.slice(startIndex, startIndex + rowOffset)
      // const countrySegment = result.slice(startIndex, startIndex + rowOffset)
        // .filter(s => !((s.includes('+') || s.includes('-') || s.includes('!'))))
        // .filter((s, i) => i === 0 || !isFirstCharLetter(s)) //  && (Number(s.slice(1, 2)) > 0)))

      const countrySegment = baseSlice
      // Join cells starting with ','
      .reduce((input, value, i) => {
        if (value[0] !== ',' && value.slice(0, 2) !== '0,') {
          return input.concat(value)
        }

        const output = input.map(v => v)
        output[output.length-1] = input.at(-1) + value
        return output
      }, [] as string[])
      .reduce((input, value) => {
        // @ts-ignore
        if ((input.at(-1) === '0' && value === '0') || (input.at(-1) === "ꟷ" && value === "ꟷ")) {
          return input.concat([value, 'p'])
        }

        return input.concat(value)
      }, [] as string[])
      .slice(1, 21)
      .filter((v, i) => i%3 !== 2)
      // .filter(s => !((s.includes('+') || s.includes('-') || s.includes('!'))))
      // .filter((s, i) => i === 0 || !isFirstCharLetter(s)) //  && (Number(s.slice(1, 2)) > 0)))

      if (countrySegment.some(v => v.includes('+') || v.includes('-'))) {
        console.log('Broken', startString, countrySegment.map(v => v.padEnd(6,' ')).join('|'))
        return
      }

      const valueSum = sum(countrySegment.filter((v, i) => [0, 2, 4, 6, 8, 10].includes(i))
        .filter(v => v !== null)
        .map(toNumber)
      )
      const total = toNumber(countrySegment[12])
      
      if (valueSum !== total) {
        console.log('Sum error', startString, startString, valueSum - total, valueSum, total)
        return
      }

      console.log('Working', startString)

      // console.log(countrySegment.map(v => v.padEnd(6,' ')).join('|'), startString)
      // console.log('2', countrySegment)

      // console.log(countrySegment[0], countrySegment.length)
      // if (countrySegment.length < )

      // console.log('countrySegment', result.slice(startIndex, startIndex + rowOffset), countrySegment)

      const index = 0
      const market = {
        country: baseSlice[index],
        data: [
          {
            x: DateTime.fromISO(date, { zone: 'utc' }),
            bev: toNumber(countrySegment[index]),
            phev: toNumber(countrySegment[index+2]),
            hybrid: toNumber(countrySegment[index+4]),
            other: toNumber(countrySegment[index+6]),
            petrol: toNumber(countrySegment[index+8]),
            disel: toNumber(countrySegment[index+10]),
            total: toNumber(countrySegment[index+12]),
          },
          {
            x: DateTime.fromISO(date, { zone: 'utc' }).minus({ year: 1 }),
            bev: toNumber(countrySegment[index+1]),
            phev: toNumber(countrySegment[index+3]),
            hybrid: toNumber(countrySegment[index+5]),
            other: toNumber(countrySegment[index+7]),
            petrol: toNumber(countrySegment[index+9]),
            disel: toNumber(countrySegment[index+11]),
            total: toNumber(countrySegment[index+13]),
          },
        ]
      }

      if (market.country.length < 2) {
        console.warn('No data', market.country, startString)
        return
      }

      // console.log('countries', countries)

      // Export data
      // countries.forEach(market => {
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
        // console.log(countries)
      })
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

