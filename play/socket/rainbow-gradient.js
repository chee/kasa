const net = require('net')
const socket = net.connect('/tmp/blub')
const tinygradient = require('tinygradient')
const sleep = require('../util/sleep')

const rainbow = tinygradient([
  '#ff2217',
  '#ffaa11',
  '#eeee22',
  '#33ff66',
  '#33ccff',
  '#1111ee',
  'purple',
  '#9933ec',
  '#ff22ee',
  '#ff2255'
]).rgb(200)

;(async () => {
  while (true) {
    for (const color of rainbow) {
      socket.write(color.toHexString())
      await sleep(7 * 7 * 2)
    }
  }
})()
