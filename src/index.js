const schedule = require('node-schedule')
const request = require('request')
const mockData = require('./mock-data')
const date = require('./date')

module.exports =
  class Canon {
    constructor (opt) {
      var self = this

      this.opt = opt

      // accept a single sensor or an array of sensors
      if (!(typeof opt.sensors === Array)) {
        this.sensors = [opt.sensors]
      }

      this.sensors = opt.sensors
      this.targetURL = opt.URL
      this.putCounter = 0
      this.postCounter = 0
      this.cronStrPost = opt.cronStrPost
      this.cronStrPut = opt.cronStrPut

      this.preallocate = function (URL) {
        this.postCounter++

        if (URL) self.targetURL = URL

        self.sensors.forEach(preallocateCb)

        function preallocateCb (sensor) {
          // Request sends POST requests to the sensor API. Connection to
          // MongoDB, C(R)U(D) operatiosn are handled by the app with
          // mongoose etc...
          request({
            url: self.targetURL,
            method: 'POST',
            json: mockData(sensor, self.cronStrPost, self.cronStrPut)
          }, function optionalCallback (err, res) {
            if (err) {
              console.error('POST failed:', err)
            }
            console.log('Server responded with:', res.body)
          })
        }
      }

      this.fire = function () {
        self.putCounter++

        self.sensors.forEach(forEachCb)

        function forEachCb (sensor) {
          // emit the 'data' event of the sensor only once! The time until a
          // 'data' event is emmited depends on the freq value of the
          // five.Sensor() instance. Default is 25 ms.
          sensor.once('data', fireCallback)

          function fireCallback () {
            var data = NaN
            if (sensor.valueAs) {
              data = this[sensor.valueAs]
            } else {
              data = this.value
            }
            var sensorData = {
              _id: sensor.id + ':' + date.post(self.cronStrPost),
              data: {
                time: date.put(self.cronStrPut),
                value: data
              }
            }

            // request is used to send PUT requests to the sensor
            // API. Connection to mongodb, the update operation etc. are then
            // handled by the app with mongoose etc...
            request({
              url: self.targetURL + sensorData._id,
              method: 'PUT',
              json: sensorData
            }, function optionalCallback (err, res) {
              if (err) {
                console.error('PUT failed:', err)
              }
              console.log('PUT successful!  Server responded with:', res.body)
            })
          }
        }
      }
    }

    continuousFire (URL) {
      let self = this
      // If URL is passed as optional argument, set it
      if (URL) this.targetURL = URL

      // preallocate (post) once and then according to cron schedule
      this.preallocate()
      schedule.scheduleJob(this.cronStrPost, function () {
        self.preallocate()
      })
      // fire (put) once and then according to cron schedule
      schedule.scheduleJob(this.cronStrPut, function () {
        self.fire()
      })
    }
}
