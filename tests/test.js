const five = require('johnny-five')
const SensorCanon = require('../src/index')

const board = new five.Board()
const targetUrl = 'http://127.0.0.1:3000/sensor-api/sensors'

board.on('ready', function () {
  // a simple sensor of the Sensor class, no valueAs needed
  const photoresistor = new five.Sensor({
    id: 'photoresistor',
    pin: 'A1'
  })

  // a second, more specific sensor. valueAs has to be set!:
  const thermometer = new five.Thermometer({
    id: 'thermometer',
    controller: "HTU21D",
    valueAs: 'celsius' // also possible: kelvin, fahrenheit
  })

  const sensorArray = [photoresistor, thermometer]

  const sensorCanon = new SensorCanon({
    sensors: sensorArray,
    targetUrl: targetUrl,
    postFreq: '* * * * *',
    putFreq: '* * * * * *' // optional; set only when preallocation is desired
  })

  // The canon is now ready to fire:
  sensorCanon.continuousFire()
  // for testing you can also do:
  // canon.preallocate()
  // canon.fire()
})
