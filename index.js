const crypto = require('crypto')
const noble = require('noble')
const {
  DEFAULT_NAME,
  DEFAULT_PASSWORD,
  CONTROL_SERVICE_UUID
} = require('./constants')

const nobleReady = new Promise(resolve =>
  noble.on('stateChange', state => {
    state === 'poweredOn' && resolve()
  })
)

const range = to => Array(to).fill().map((_, i) => i)

// pass this the callback and a new Promise's resolve and it will give you a
// function you can pass down as a callback to noble
const createResolver = ({callback, resolve}) => (...args) => {
  callback && callback(...args)
  return resolve(...args)
}

const emptyBuffer = Buffer.from([])

// encrypt the packet in the manner the kasa bulb expects
function encrypt (key, data) {
  key = Buffer.from(key)
  key.reverse()
  data = Buffer.from(data)
  data.reverse()

  // use createCipheriv, as createCipher expects a password as a string rather
  // than a Buffer
  const cipher = crypto.createCipheriv(
    'aes-128-ecb',
    key,
    // empty buffer, for we have no iv
    emptyBuffer
  )
  const encryptedData = cipher.update(data).reverse()
  return encryptedData
}

function generateSk (name, password, data1, data2) {
  name = Buffer.from(name.padEnd(16, '\u0000'))
  password = Buffer.from(password.padEnd(16, '\u0000'))
  const key = []
  name.forEach((byte, index) => {
    key.push(byte ^ password[index])
  })
  const data = [...data1.slice(0, 8), ...data2.slice(0, 8)]
  return encrypt(key, data)
}

function encryptKey (name, password, data) {
  name = Buffer.from(name.padEnd(16, '\u0000'))
  password = Buffer.from(password.padEnd(16, '\u0000'))
  const key = []
  key.forEach.call(name, (byte, index) => {
    key.push(byte ^ password[index])
  })
  return encrypt(data, key)
}

// mutate me mor
// TODO very rewrite this
function encryptPacket (sk, mac, packet) {
  let tmp = [
    ...mac.slice(0, 4),
    0x01,
    ...packet.slice(0, 3),
    15, 0, 0, 0, 0, 0, 0, 0
  ]
  tmp = encrypt(sk, tmp)

  range(15).forEach(i => {
    tmp[i] = tmp[i] ^ packet[i + 5]
  })

  tmp = encrypt(sk, tmp)

  range(2).forEach(i => {
    packet[i + 3] = tmp[i]
  })

  tmp = [
    0,
    ...mac.slice(0, 4),
    0x01,
    ...packet.slice(0, 3),
    0, 0, 0, 0, 0, 0, 0
  ]

  let tmp2 = []

  range(15).forEach(i => {
    if (i === 0) {
      tmp2 = encrypt(sk, tmp)
      tmp[0] = tmp[0] + 1
    }
    packet[i + 5] ^= tmp2[i]
  })

  return Buffer.from(packet)
}

function connect (light, callback) {
  return light.connect(() => callback(light))
}

function discover (options = {}, callback) {
  if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      callback = arguments[0]
      options = {}
    }
  }

  const {name = DEFAULT_NAME, password = DEFAULT_PASSWORD, address} = options
  const discovery = new Promise(resolve => {
    const resolver = createResolver({callback, resolve})
    noble.on('discover', thing => {
      if (thing.advertisement.localName !== name) return

      thing.password = password

      // if we were looking for a specific device, only resolve if we have it
      if (address) {
        address === thing.address && connect(thing, resolver)
      } else {
        connect(thing, resolver)
      }
    })
  })

  noble.startScanning()
  return discovery
}

const createPacket = (function () {
  let packetCount = Math.random() * 0xffff | 0
  return function createPacket (id, command, data) {
    const packet = Array(20).fill(0)
    packet[0] = packetCount & 0xff
    packet[1] = packetCount >> 8 & 0xff
    packet[5] = id & 0xff
    packet[6] = id & 0xff | 0x80
    packet[7] = command
    packet[8] = 0x69
    packet[9] = 0x69
    packet[10] = data[0]
    packet[11] = data[1]
    packet[12] = data[2]
    packet[13] = data[3]
    packetCount = packetCount > 0xffff ? 1 : packetCount + 1
    return packet
  }
})()

function parseMacAddress (mac) {
  return mac
    .split(':')
    .slice(0, 6)
    .reverse()
    .map(n => parseInt(n, 16))
}

const initData = [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0, 0, 0, 0, 0, 0, 0, 0]

function pair (light, callback) {
  const name = light.name || light.advertisement.localName
  const password = light.password
  return new Promise((resolve, reject) => {
    const resolver = createResolver({callback, resolve})
    light.discoverAllServicesAndCharacteristics(() => {
      const controlService = light.services.find(({uuid}) =>
        uuid === CONTROL_SERVICE_UUID
      )

      // it might be wise to use the characteristics' uuid also
      const commandCharacteristic = controlService.characteristics[1]
      const pairCharacteristic = controlService.characteristics[3]
      const data = [...initData]
      const encryptedKey = encryptKey(name, password, data)

      const packet = [0x0c]
        .concat(data.slice(0, 8))
        .concat([...encryptedKey].slice(0, 8))

      pairCharacteristic.write(new Buffer(packet), true, () => {
        pairCharacteristic.read((error, received) => {
          if (error) return reject(error)

          const sk = generateSk(
            name,
            password,
            data.slice(0, 8),
            received.slice(1, 9)
          )

          function dispatch ([id, command, data], callback) {
            const packet = createPacket(id, command, data)
            const macKey = Buffer.from(parseMacAddress(light.address))
            const encryptedPacket = encryptPacket(sk, macKey, packet)
            return new Promise(resolve => {
              const resolver = createResolver({callback, resolve})
              commandCharacteristic.write(encryptedPacket, false, resolver)
            })
          }
          return resolver(dispatch)
        })
      })
    })
  })
}

function sendCommand (command, ...args) {
  return [0xffff, command, args]
}

// red, green, blue, brightness
function setColor (...values) {
  return sendCommand(0xc1, ...values)
}

function setDefaultColor (...values) {
  return sendCommand(0xc4, ...values)
}

module.exports = {
  discover: (...args) => nobleReady.then(() => discover(...args)),
  pair,
  setColor,
  setDefaultColor
}
