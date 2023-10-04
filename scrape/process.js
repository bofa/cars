import { DateTime } from 'luxon'
import { sum } from 'mathjs'
// import se from './output/SE.json' assert { type: "json" }
import { promises as fs} from 'fs'
import { basicProjection } from './simulator.js'

const countryCodes = [
  // 'CH',
  'DE',
  // 'DK',
  // 'ES',
  // 'FI',
  // 'IE',
  // 'IT',
  // 'NL',
  // 'NO',
  'SE',
]

const options = countryCodes.map(countryCode => ({
  countryCode,
  filename: `${countryCode}-brand-sales.json`,
}))

// fs.writeFile(`src/options.json`, JSON.stringify(options, null, 2))

const noneElectricSales$ = fs.readFile(`./scrape/none-electric.json`, 'utf8')

options.forEach(option => Promise.all([
  fs.readFile(`./scrape/output/${option.countryCode}.json`, 'utf8'),
  noneElectricSales$,
]).then(([countryString, noneElectricSales]) => [JSON.parse(countryString), JSON.parse(noneElectricSales)])
  .then(([country, noneElectricSales]) => {
    console.log('noneElectricSales', option.countryCode, noneElectricSales)
    const brandSales = Object.keys(country)
      .map(key => ({
        noneElectric: noneElectricSales[option.countryCode]?.[key],
        ...country[key]
      }))
      .map(month => {
        console.log('month', month)
        return month
      })
      // .map(key => country[key])
      // .slice(0, 1)
      .map(month => ({
        noneElectric: month.noneElectric,
        x: DateTime.fromFormat('' + month.year + month.month, 'yyyyM'),
        brands: month.formatted
          .filter(brand => brand.length > 0)
          .map(brand => ({
            id: brand[0],
            sales: +brand[1],
          }))
      }))

      .map(month => ({
        ...month,
        electric: sum(month.brands.map(brand => brand.sales)),
      }))
      .filter(month => month.electric > 0)
      .sort((a, b) => a.x - b.x)

    const run = [brandSales.map(d => d.electric), brandSales.map(d => d.noneElectric)]

    console.log('run', run)

    const projection = basicProjection(run, brandSales[0].x);

    const output = {
      historical: {
        electricBrands: brandSales.map(d => ({ x: d.x, y: d.brands })),
        electric: brandSales.map(d => ({ x: d.x, y: d.electric })),
        noneElectric: brandSales.map(d => ({ x: d.x, y: d.noneElectric })),
      },
      projection,
    }

    return fs.writeFile(`public/${option.filename}`, JSON.stringify(output, null, 2))
  })
)
