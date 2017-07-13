const {createInterface} = require('readline')
const {discover, pair, setColor} = require('kasa')

const blubs = []
const paired = []

const prompt = 'hex color: '
const firstPrompt = `pls give me a ${prompt.slice(0, -2)} (like #ff2a50): `
const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: firstPrompt
})

const ready = new Promise(resolve => {
  discover(blub => {
    const {address} = blub
    if (!paired.includes(address)) {
      pair(blub, dispatch => {
        resolve()
        blubs.push(dispatch)
        paired.push(address)
      })
    }
  })
})

const chunk = (size, sequence) => {
  const chunks = []
  let index = 0
  while (index < sequence.length) {
    chunks.push(sequence.slice(index, index += size))
  }
  return chunks
}

const parse = string =>
  chunk(2, string.replace(/^#/, '')).map(hex => parseInt(hex, 16))

console.log('looking for blubs...')

readline.on('line', line => {
  const color = parse(line.trim())
  // as a little bonus, you can pass a color like #ff2a50cc
  // where the last byte is the brightness :O
  blubs.forEach(dispatch => dispatch(setColor(...color, 0xff)))
  readline.setPrompt(prompt)
  readline.prompt()
})

ready.then(() => readline.prompt())
