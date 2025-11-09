import { DateTime } from 'luxon'
import { basicProjection } from './simulator'
const fs = require('fs')

type Point = {
  x: string
  total: number
  bev: number
  phev:   number|null
  hybrid: number|null
  other:  number|null
  petrol: number|null
  disel:  number|null
}

const categories = [
  { category: 'cars',         step: 'months' },
  { category: 'heavytrucks',  step: 'quarters' },
  { category: 'mediumtrucks', step: 'quarters' },
  { category: 'van',          step: 'quarters' },
  { category: 'busses',       step: 'quarters' },
] as const

categories.forEach(({ category, step }) => {

const folderRead = './public/sales/'
const allFiles: string[] = fs.readdirSync(folderRead)
  .filter((file: string) => file.includes('.json'))
  .filter((file: string) => file.startsWith(category + '-'))
  // .filter(file => file.includes('Germany'))

// Run simulator
allFiles
// Debug
// .slice(0, 3)
// .reverse()
.forEach(file => {
  const marketLabel = file.split('-')[1].slice(0, -5)
  const content: Point[] = JSON.parse(fs.readFileSync(folderRead + file))

  const make = 'bev'
  const series = [
    content.map(d => d[make]),
    content.map(d => d.total - d[make]),
  ]
  const startDate = DateTime.fromISO(content[0].x, { zone: 'utc' })

  const projectionSteps = DateTime.fromISO('2039-12-01', { zone: 'utc' }).diff(startDate, step)[step]
  const { combustionSeries, bevSeries, baseLine, projectedSales } = basicProjection(series, startDate, step, Math.ceil(projectionSteps) + 1)
  
  const fleetFormatted = bevSeries.data.map((d, i) => ({
    x: d.x,
    bev: d.y,
    total: d.y + combustionSeries.data[i].y
  }))

  const salesFormatted = bevSeries.data.map((d, i) => ({
    x: d.x,
    bev: projectedSales.data[i].y,
    // TODO
    // total: series[i][1]
  }))

  const outputFileFleet = `./public/projections/fleet/${category}-${marketLabel}.json`
  fs.writeFileSync(outputFileFleet, JSON.stringify(fleetFormatted, null, 2))

  const outputFileSales = `./public/projections/sales/${category}-${marketLabel}.json`
  fs.writeFileSync(outputFileSales, JSON.stringify(salesFormatted, null, 2))

  console.log('Done', category, marketLabel)
})

})
