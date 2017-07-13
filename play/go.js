const Blub = require('kasa')
const blubs = []
const paired = []

Blub.discover(blub => {
  const {address} = blub
  if (!paired.includes(address)) {
    Blub.pair(blub, dispatch => {
      console.log(`got a ${address}`)
      blubs.push(dispatch)
      paired.push(address)
    })
  }
})

const randomByte = () => Math.random() * 0xf00 | 0

setInterval(() =>
  blubs.forEach(dispatch => dispatch(Blub.setColor(randomByte(), randomByte(), randomByte(), 0xff))), 250)
