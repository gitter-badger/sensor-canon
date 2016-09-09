const schedule = require('node-schedule')
const rp = require('request-promise')
const date = require('./helpers/date')
const verify = require('./helpers/verify')
const mockData = require('./helpers/mock-data')

module.exports =
  class Canon {
    constructor (opt) {
      /*
      verify options
      */
      try {
        verify(opt)
      } catch (err) {
        console.error(err)
      }

      /*
      if a single sensor is passed, put it into an array...
       */
      if (!Array.isArray(opt.sensors)) {
        this.sensors = [opt.sensors]
      } else {
        this.sensors = opt.sensors
      }

      /*
      Construct the rest...
       */
      this.targetUrl = opt.targetUrl
      this.postFreq = opt.postFreq
      this.putFreq = opt.putFreq
      this.putCounter = 0
      this.postCounter = 0

      /*
      Are POST and PUT frequency set?
      */
      this.postAndPut = !!(opt.postFreq && opt.putFreq)
    }

    preallocate () {
      this.sensors.forEach((sensor) => {
        this.postCounter++

        const options = {
          method: 'POST',
          uri: this.targetUrl,
          body: mockData(sensor, this.postFreq, this.putFreq),
          json: true // Automatically stringifies the body to JSON
        }

        rp(options)
          .then(function (body) {
            console.log('POST sucessful! Server responsed: ', body)
          })
          .catch(function (err) {
            console.error(err)
          })
      })
    }

    fire () {
      this.sensors.forEach((sensor) => {
        /*
        emit the 'data' event of the sensor only once! The time until a
        'data' event is emmited depends on the freq value of the
        five.Sensor() instance. Default is 25 ms.
         */
        sensor.once('data', () => {
          this.putCounter++

          let requestMethod = ''
          let requestUrl = ''

          let data = NaN
          if (sensor.valueAs) {
            data = sensor[sensor.valueAs]
          } else {
            data = sensor.value
          }

          const sensorData = {
            _id: sensor.id + ':' + date.post(this.postFreq),
            data: {
              time: date.put(this.putFreq),
              value: data
            }
          }

          if (this.postAndPut) {
            requestMethod = 'PUT'
            requestUrl = `${this.targetUrl}/${sensorData._id}`
          } else {
            requestMethod = 'POST'
            requestUrl = this.targetUrl
          }

          const options = {
            method: requestMethod,
            uri: requestUrl,
            body: sensorData,
            json: true
          }

          rp(options)
            .then((body) => {
              console.log('Fired successfully! Server response: ', body)
            })
            .catch(function (err) {
              console.error(err)
            })
        })
      })
    }

    continuousFire () {
      if (this.postAndPut) {
        // preallocate (post) once and then according to cron schedule
        this.preallocate()
        schedule.scheduleJob(this.postFreq, () => {
          this.preallocate()
        })
        // fire (put) according to cron schedule
        schedule.scheduleJob(this.putFreq, () => {
          this.fire()
        })
      } else {
        // fire (put) according to cron schedule
        schedule.scheduleJob(this.putFreq, () => {
          this.fire()
        })
      }
    }
}
