import { DateTime } from 'luxon'
import { basicProjection } from './simulator'

type Point = {
  x: string
  total: number
  bev: number
  phev: number|null
  hybrid: number|null
  other: number|null
  petrol: number|null
  disel: number|null
}

const fs = require('fs')

const folderRead = './public/sales/'
const allFiles = fs.readdirSync(folderRead)
  .filter(file => file.includes('.json'))
  .filter(file => file.startsWith('cars-'))

// Run simulator
allFiles
// Debug
// .slice(0, 1)
.forEach(file => {
  const marketLabel = file.split('-')[1].slice(0, -5)
  const content: Point[] = JSON.parse(fs.readFileSync(folderRead + file))

  const make = 'bev'
  const series = [
    content.map(d => d[make]),
    content.map(d => d.total - d[make]),
  ]
  const startDate = DateTime.fromISO(content[0].x, { zone: 'utc' })

  
  const [combustionSeries, bevSeries, baseLine, projectedSales] = basicProjection(series, startDate)
  
  console.log('series', series)
  
  const projectionFormatted = bevSeries.data.map((d, i) => ({
    x: d.x,
    bev: d.y,
    total: d.y + combustionSeries.data[i].y
  }))

  const outputFile = `./public/projections/${marketLabel}.json`
  fs.writeFileSync(outputFile, JSON.stringify(projectionFormatted, null, 2))
  console.log('Done ' + marketLabel)
})
