const net = require('net')
const sleep = require('../util/sleep')
const socket = net.connect('/tmp/blub')

const colors = [
  '#ff2217',
  '#ff4522',
  '#ffff00',
  '#33ff66',
  '#33ccff',
  '#1111ee',
  '#9933ec',
  '#ff2a50'
]

;(async function rainbow (index = 0) {
  socket.write(colors[index])
  await sleep(500)
  rainbow(index === colors.length - 1 ? 0 : index + 1)
})()
