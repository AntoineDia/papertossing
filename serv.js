const express = require('express')
const path = require('path')
const fs = require('fs')

const app = express()
const server = app

const codeFolder = path.join(__dirname, '../code')
const port = 3003
let localAdress = ''

const os = require('os')
const ifaces = os.networkInterfaces()

Object.keys(ifaces).forEach(function (ifname) {
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) return
    if(ifname !== "Wi-Fi") return
    localAdress = iface.address
  })
})

app
  .use('/local', express.static(codeFolder))
  .get('/paper-toss', (req, res) => {
    const html = fs.readFileSync(codeFolder + '/paper-toss/index.html', 'utf8')
    const htmlPaths  = html.replace(/\.\//g, '/local/paper-toss/')
    res.send(htmlPaths)
  })
  .listen(port, () => console.log(`started on http://${localAdress}:${port}/paper-toss`))
