const fs = require('fs')

const folderRead = './public/'
const outputFile = './src/assets/selection.json'

const allFiles = fs.readdirSync(folderRead).filter(file => file.includes('.json'))

console.log('allFiles', allFiles)

const output = allFiles
// Debug
// .slice(0, 1)
.map(file => {
  const marketLabel = file.split('-')[1].slice(0, -5);
  const content = JSON.parse(fs.readFileSync(folderRead + file));

  return {
    id: marketLabel,
    name: marketLabel,
    latest: content.slice(-12).reduce((out, month) => ({
      x: month.x,
      bev: out.bev + month.bev,
      phev: out.phev + month.phev,
      hybrid: out.hybrid + month.hybrid,
      other: out.other + month.other,
      petrol: out.petrol + month.petrol,
      disel: out.disel + month.disel,
      total: out.total + month.total,
    })),
  }
})

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

