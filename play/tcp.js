const net = require('net')
const Blub = require('kasa')
const blubs = []
const paired = []

Blub.discover(blub => {
  const {address} = blub
  if (!paired.includes(address)) {
    Blub.pair(blub, dispatch => {
      blubs.push(dispatch)
      paired.push(address)
    })
  }
})

const port = process.env.PORT || 17000

net.createServer(connection => {
  connection.on('data', data => {
    console.log({data}, 'data here', data.toString())
    const hexmatch = data.toString().match(/^#([\da-z]{2})([\da-z]{2})([\da-z]{2})/)
    const rgbmatch = data.toString().match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\)/)
    const brightness = 0xaa
    let red, green, blue
    if (hexmatch) {
      [red, green, blue] = hexmatch.slice(1).map(n => parseInt(n, 16))
    }
    if (rgbmatch) {
      [red, green, blue] = rgbmatch.slice(1)
    }
    console.log(`setting blubs to red: ${red}, green: ${green}, blue: ${blue}`)
    blubs.forEach(dispatch => dispatch(Blub.setColor(red, green, blue, brightness)))
  })
}).listen(port, () => {
  console.log('server bound on %s', port)
})
