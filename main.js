const path = require('path')
const fs = require('fs')

var devFolder = path.join(__dirname + '/server')

fs.readdir(devFolder, (err, files) => {
  let col = ''
  files.forEach(fileName => {
    const filePath = devFolder + '/' + fileName
    col += fs.readFileSync(filePath, 'utf8') + '\n'
  })
  const buildPath = path.join(__dirname + '/static/gameBuild.js')
  fs.writeFileSync(buildPath, col, err => console.log(err))
  process.exit()
})

