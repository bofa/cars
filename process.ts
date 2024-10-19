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
    latest: content.at(-1),
  }
})

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

