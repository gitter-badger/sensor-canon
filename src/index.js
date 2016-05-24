const moment = require('moment')
const schedule = require('node-schedule')
const request = require('request')
const lookups = require('./lookups')

module.exports =
  class Canon {
    constructor () {
      var self = this

      this.sensors = []
      this.targetURL = ''
      this.postFreq = ''
      this.putFreq = ''
      this.combinedFreq = ''
      this.putCounter = 0
      this.dataArrayLength = 0
      this.dateStrPost = ''
      this.cronStringPost = ''
      this.dateStrPut = ''
      this.cronStringPut = ''

      this.reset = function () {
        this.sensors = []
        this.targetURL = ''
        this.postFreq = ''
        this.putFreq = ''
        this.combinedFreq = ''
        this.putCounter = 0
        this.dataArrayLength = 0
        this.dateStrPost = ''
        this.cronStringPost = ''
        this.dateStrPut = ''
        this.cronStringPut = ''
      }

      this.preallocate = function (URL) {
        if (URL) self.targetURL = URL

        // Generate mock data for preallocation
        var mockArray = new Array(self.dataArrayLength)
        mockArray.fill({time: NaN, value: NaN})

        self.sensors.forEach(prealloCallback)

        function prealloCallback (sensor) {
          var mockData = {
            _id: sensor.id + ':' + moment().format(self.dateStrPost),
            data: mockArray
          }
          // request is used to send POST requests to the sensor
          // API. Connection to mongodb, the create operation is then
          // handled by the app with mongoose etc...
          request({
            url: self.targetURL,
            method: 'POST',
            json: mockData
          }, function optionalCallback (err, res) {
            if (err) {
              console.error('POST failed:', err)
            }
            console.log('Server responded with:', res.body)
          })
        }
      }

      this.fire = function () {
        // Keep track of number sensor reads
        self.putCounter++

        self.sensors.forEach(forEachCallback)

        function forEachCallback (sensor) {
          // emit the 'data' event of the sensor only once! The time until a
          // 'data' event is emmited depends on the freq value of the
          // five.Sensor() instance. Default is 250 ms.
          sensor.once('data', fireCallback)

          function fireCallback (data) {
            var sensorData = {
              _id: sensor.id + ':' + moment().format(self.dateStrPost),
              data: {
                time: moment().format(self.dateStrPut),
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

    load (sensorArray, URL, postFreq, putFreq) {
      this.reset()
      this.sensors = sensorArray
      this.targetURL = URL

      this.postFreq = postFreq
      this.putFreq = putFreq
      // The length of the data array in the sensor data results
      // from preallocation and fire Freq, therefor a concatenated
      // freq string is created and used for the lookup
      this.combinedFreq = postFreq + putFreq

      this.dataArrayLength = lookups.arrayLength[this.combinedFreq]
      this.dateStrPost = lookups.datePost[postFreq]
      this.dateStrPut = lookups.datePut[putFreq]
      this.cronStringPost = lookups.cronString[postFreq]
      this.cronStringPut = lookups.cronString[putFreq]
    }

    continuousFire (URL) {
      let self = this
      // If URL is passed as optional argument, set it
      if (URL) this.targetURL = URL

      // preallocate (post) once and then according to cron schedule
      this.preallocate()
      schedule.scheduleJob(this.cronStringPost, function () {
        self.preallocate()
      })
      // fire (put) once and then according to cron schedule
      this.fire()
      schedule.scheduleJob(this.cronStringPut, function () {
        self.fire()
      })
    }
}
