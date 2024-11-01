import { DateTime } from 'luxon'
const fs = require('fs')

type Data = {
  x: string
  bev: number
  phev: number
  hybrid: number
  other: number
  petrol: number
  disel: number
  total: number
}

const folderRead = './acea_commercial/process/'
const outputFolder = './public/sales/'

const allFiles = fs.readdirSync(folderRead)
.filter(file => file.includes('.json'))
// .filter(file => file.startsWith('heavy-trucks-'))

const output = allFiles
// Debug
// .slice(0, 0)
.forEach(file => {
  const segment = file.split('-')[0]
  const marketLabel = file.split('-')[1].slice(0, -5)
  const outputFile = outputFolder + segment + '-' + marketLabel + '.json'
  const content: Data[] = JSON.parse(fs.readFileSync(folderRead + file))

  const output = content
  .map(p => ({
    ...p,
    x: DateTime.fromISO(p.x),
  }))
  .map((current, index, array) => {
    if (current.x.month === 1) {
      return current
    }

    return ({
      x: current.x,
      bev: current.bev - array[index-1].bev,
      phev: current.phev - array[index-1].phev,
      hybrid: current.hybrid - array[index-1].hybrid,
      other: current.other - array[index-1].other,
      petrol: current.petrol - array[index-1].petrol,
      disel: current.disel - array[index-1].disel,
      total: current.total - array[index-1].total,
    })
  })

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2))
})

console.log('output', output)
