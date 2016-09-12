# sensor-canon

Fire a scheduled time series of (johnny-five) sensor data against any RESTful API.

![johnny-fire](/img/sensor-canon.gif)

[![NPM](https://nodei.co/npm/sensor-canon.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/sensor-canon/)


## Install

```js
$ npm install --save sensor-canon
```


## Why this module?

Thanks to fantastic [johnny-five](http://johnny-five.io), collecting sensor data with JavaScript/Node.js is a piece of cake. However, I found myself struggling to turn the sensor data into a scheduled time series which can be efficiently stored in a database. The sensor-canon wraps this functionality in a single class. It generates a scheduled time series of POST and/or PUT requests carrying the sensor data as payload in .json format. The idea is to fire these requests against POST/PUT endpoints wired up to a object-oriented database like MongoDB.

Currently, the sensor-canon can fire in two different modes:

- POST only (when passing only a POST frequency to the canon - see description below): Data from each scheduled sensor read is send as POST request and (on the receiving end) can be  inserted as a separate database document. This approach should be efficient enough for most applications.

- POST and PUT (when passing a POST and a PUT frequency): The canon first sends a POST requests carrying appropriately shaped placeholder data for pre-allocation to the database. Subsequently, PUT requests carrying real sensor data for updating the pre-allocated document are send. This approach can drastically increases database performance (when using MongoDB for example) and allows applications involving thousands of sensors as well as high update and query frequencies. Check out [this post by Sandeep Parikh and Kelly Stirman](http://blog.mongodb.org/post/65517193370/schema-design-for-time-series-data-in-mongodb) and [these talks](https://www.mongodb.com/presentations/mongodb-time-series-data-part-1-setting-stage-sensor-management) to get an example.

The frequencies for both, pre-allocation (POST) and update (PUT) requests are set using cron expressions. The sensor-canon uses [cron-parser](https://github.com/harrisiirak/cron-parser) and [node-schedule](https://github.com/node-schedule/node-schedule) for generation of correctly shaped pre-allocation data and for scheduling.


## Usage

```js
const five = require('johnny-five')
const SensorCanon = require('sensor-canon')

const board = new five.Board()

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
    targetUrl: 'endpoint_wired_up_to_database',
    postFreq: '* * * * *',
    putFreq: '* * * * * *' // optional; set only when preallocation is desired
  })

  // The canon is now ready to fire:
  SensorCanon.continuousFire()
  // for testing you can also do:
  // canon.preallocate()
  // canon.fire()
})
```

First, require johnny-five and the sensor-canon and instantiate a new board. Next, instantiate a single (or a bunch of) [johnny-five sensors](http://johnny-five.io/api/sensor/) as usual but mind the following:

__Give each sensor a unique id (photoresistor and thermometer in the example). It will be part of the compound index that the canon generates for each future database document! Also: pass a `valueAs` parameter specifying the variable name that the sensor data gets assigned by johnny-five - kelvin, celsius or fahrenheit in case of the [thermometer](http://johnny-five.io/examples/temperature-htu21d/) used in the example. Without it the canon won't be able to read the generated data! Last, when using more than one sensor, put the sensors into an array.__

Subsequently, instantiate an new canon and pass an options object specifying the `sensors` (a single sensor or an array of them), a `targetUrl` as well as cron expressions for setting a `postFreq` and (if preallocation is desired) a `putFreq`.

The canon is then ready and you can use one of three methods to fire it: `preallocate()`, `fire()` and `continuousFire()`. `preallocate()` sends a single POST request with preallocation data. Works only when both postFreq and putFreq are set. `fire()` sends a single POST or PUT request depending on the options passed to the canon. `continuousFire()` continuously sends POST requests only or POST followed by PUT requests - again depending on the options passed to the canon.

In the example above, for each sensor a POST request with pre-allocation data is send every minute `'* * * * *'` and a PUT request carrying real sensor data is send every second `'* * * * * *'`. Consequently the pre-allocation data in the POST request contains placeholders for 60 datapoints and would have the following structure for the photoresistor from the above example:

```js
{
  _id: 'photoresistor:201606071510',  
  data: [
  {
    time: NaN,
    value: NaN
  },
  //... 60 times!
  ]
}
```

The \_id is a compound index of the unique sensor id and a date string specifying the current minute. The data array contains 60 placeholder objects `(time: NaN, value: NaN}` which should be included in the document that gets pre-allocated to the database. Sensor data for updating this document (PUT payload) would be structured like this:

```js
{
  _id: 'photoresistor:201606071510',  // used to find the document in the db!
  data: {
    time: '20160607151023', // here: with resolution down to the second
    value: 423
  }
}
```

__Please note:__ The sensor-canon currently accepts only simple cron expressions with '\*' in each position) when both a POST and a PUT frequency are set. Work on supporting a wider range of cron expressions is in progress. Contributions are very welcome! The full range of cron expressions is supported when POSTing only.


## Further reading

To better understand the motivation for writing the sensor-canon, have a look at my [blog post](http://blog.mongodb.org/post/65517193370/schema-design-for-time-series-data-in-mongodb), [this post by Sandeep Parikh and Kelly Stirman](http://blog.mongodb.org/post/65517193370/schema-design-for-time-series-data-in-mongodb) and [these talks](https://www.mongodb.com/presentations/mongodb-time-series-data-part-1-setting-stage-sensor-management)

## Todos

[ ] Add tests  
[ ] Support a wider range of cron-expressions

## Copyright and license

Copyright 2016 Matthias Munder.  
Licensed under the [MIT license](./LICENSE).


[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
