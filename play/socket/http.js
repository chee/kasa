// note: this one requires ./socket to be running
const net = require('net')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const socket = net.connect('/tmp/blub')

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.post('/colors', function (request, response) {
  socket.write(request.body.color)
  response.send('thanks!')
})
console.log('check http://localhost:8018/')
app.listen(8018)

