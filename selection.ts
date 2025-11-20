const fs = require('fs')

const categories = [
  { category: 'cars',         step: 12/1 },
  { category: 'heavytrucks',  step: 12/3 },
  { category: 'mediumtrucks', step: 12/3 },
  { category: 'van',          step: 12/3 },
  { category: 'busses',       step: 12/3 },
] as const

categories.forEach(({ category, step }) => {

const folderRead = './public/sales/'
const outputFile = `./src/assets/selection-${category}.json`

const allFiles: string[] = fs.readdirSync(folderRead)
  .filter((file: string) => file.includes('.json'))
  .filter((file: string) => file.startsWith(category + '-'))

const output = allFiles
// Debug
// .slice(0, 0)
.map(file => {
  const marketLabel = file.split('-')[1].slice(0, -5)
  const content = JSON.parse(fs.readFileSync(folderRead + file))

  const latest = content
    .filter(month => month.total != null)
    .slice(-step)
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
    .slice(-2*step, -step)
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

console.log('Done ' + category)

})

