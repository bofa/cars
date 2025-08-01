const fs = require('fs')

const folderRead = './public/sales/'
const outputFile = './src/assets/selection.json'

const allFiles = fs.readdirSync(folderRead)
  .filter(file => file.includes('.json'))
  .filter(file => file.startsWith('cars-'))

const output = allFiles
// Debug
// .slice(0, 0)
.map(file => {
  const marketLabel = file.split('-')[1].slice(0, -5)
  const content = JSON.parse(fs.readFileSync(folderRead + file))

  const latest = content
    .filter(month => month.total != null)
    .slice(-12)
    .reduce((out, month) => ({
      x: month.x,
      bev: out.bev + month.bev,
      phev: out.phev + month.phev,
      hybrid: out.hybrid + month.hybrid,
      other: out.other + month.other,
      petrol: out.petrol + month.petrol,
      disel: out.disel + month.disel,
      total: out.total + month.total,
    }))

  const before = content
    .filter(month => month.total != null)
    .slice(-24, -12)
    .reduce((out, month) => ({
      x: month.x,
      bev: out.bev + month.bev,
      phev: out.phev + month.phev,
      hybrid: out.hybrid + month.hybrid,
      other: out.other + month.other,
      petrol: out.petrol + month.petrol,
      disel: out.disel + month.disel,
      total: out.total + month.total,
    }))

  return {
    id: marketLabel,
    name: marketLabel,
    latest,
    before,
  }
})

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2))
