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

## api

```js
module.exports {
  // find a bulb or every bulb forever
  discover({name?, password?, address?}, callback?) -> Promise{Peripheral}
  pair({Peripheral?, callback?) -> Promise{dispatch()}

  // these return an array for use by the dispatch function that you get as
  // a gift for pairing a peripheral
  setColor(red, green, blue, brightness) -> [0xffff, 0xc1, ...args]
  setDefaultColor(red, green, blue, brightness) -> [0xffff, 0xc4, ...args]
}

// when a bulb gets paired it returns a function (to callback and .then)
// that lets you send commands to the bulb. i have called it dispatch because
// i use redux at work every day and it seemed like the most appropriate word
// because i don't know many words
// it creates the packet and sends it to the blub
// it returns an error if the command failed. i have never seen this happen so
// i don't have much information on that
dispatch([id, command, data], callback?) -> Promise{error}
```

note: there is currently a bug in noble that means it doesn't close even when
we stop scanning, because it is still listening out for adapter changes. once
the fix for that has merged, a `.stop()` will be added to the exports.

## tests

* there are literally none
* &nbsp;
* &nbsp;
* &nbsp;

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

<!-- i hope you are okay, i love you a lot -->
