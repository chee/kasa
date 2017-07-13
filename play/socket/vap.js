const net = require('net')
const socket = net.connect('/tmp/blub')
const sleep = require('../util/sleep')
const pink = '#f8caff'
const blue = '#72f0ca'

;(async function ａｅｓｔｈｅｔｉｃ (color = pink) {
  socket.write(color)
  await sleep(3000)
  ａｅｓｔｈｅｔｉｃ(color === pink ? blue : pink)
})()
