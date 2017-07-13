const {discover, setColor, pair} = require('../..')

const setColorWithDispatch = (...color) => dispatch => dispatch(setColor(...color, 0xff))

discover()
  .then(pair)
  .then(setColorWithDispatch(0x33, 0x99, 0xff))
