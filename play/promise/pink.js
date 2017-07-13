const {discover, setColor, pair, stop = process.exit} = require('kasa')

const setColorWithDispatch = (...color) => dispatch => dispatch(setColor(...color, 0xff))

discover()
  .then(pair)
  .then(setColorWithDispatch(0xff, 0x2a, 0x50))
  .then(stop)
