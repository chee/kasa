const fs = require('fs')
const net = require('net')
const Blub = require('..')
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

const path = '/tmp/blub'

fs.unlink(path, () => {
  const server = net.createServer(connection => {
    connection.on('data', data => {
      const hexmatch = data.toString().match(/^#([\da-z]{2})([\da-z]{2})([\da-z]{2})$/)
      const rgbmatch = data.toString().match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\)$/)
      const brightness = 0xaa
      let red, green, blue
      if (hexmatch) {
        [red, green, blue] = hexmatch.slice(1).map(n => parseInt(n, 16))
      }
      if (rgbmatch) {
        [red, green, blue] = rgbmatch.slice(1)
      }
      blubs.forEach(dispatch => dispatch(Blub.setColor(red, green, blue, brightness)))
    })
  }).listen(path, () => {
    console.log('server bound on %s', path)
  })
})

