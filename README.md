## smal lib for kasa veho (and tiktek?) smart bluetooth lightblibs

small library for kasa veho lightbulbs and others like it.

could not have finished this if it were not for
[this blog post](https://mjg59.dreamwidth.org/43722.html) and
[this python library](https://github.com/mjg59/python-tikteck) by
[@mjg59](https://twitter.com/mjg59). so thank you a billion times for writing
that and digging into that disassembled .so while i dug into nothing but shallow
graves

you'll note that this is nearly a carbon copy of their library

i couldn't run that because i wasn't on a loonix machine, so now this has
happened and should work on lanux and macos maybe even windows if the stars
align. relies on the wnoderful [noble](https://github.com/sandeepmistry/noble)

## use:

* with a bulb you know

```js
const {pair, setColor} = require('kasa')
pair({
  name: 'Smart Light',
  password: 'password obtained from adb lolcat',
  address: 'ca:fe:0f:be:ef' // address of light
}, dispatch => {
  // red, green, blue, brightness
  dispatch(setColor(0xff, 0x2a, 0x50, 0xff))
})
```

* with a bulb you've never met:

```js
const {discover, pair, setColor} = require('kasa')
discover({
  name: 'Smart Light', // defaults to Smart Light
  password: 'get this from adb lolcat'
}, blub => {
  console.log('a real lootblub!', blub.address)
  pair(blub, dispatch => {
    dispatch(setColor(0x33, 0xcc, 0xff, 0xff))
  })
})
```

* there is also a promise api (note that you will only get the first bulb
  discovered this way, but the callback will keep calling you up with every
  light it finds)

```js
const {discover, pair, setColor} = require('kasa')

discover()
  .then(pair)
  .then(dispatch => dispatch(setColor(0xff, 0xff, 0xff, 0xff)))
```

there are some silly examples in the directory called `play/`

## todo:

* clean up the code (vague!)
* fix vague todo items (which?)
* find out why my tongue has lumps on it
* revise the api when i have had literally any sleep in the past 3 years
* get rich, die old
* get to the top of Tom's top 8
* wear sunscreen
* learn the xaphoon
* see how lb is doin
* switch to crypto-js and pull parts out and see if this can run in web browsers
