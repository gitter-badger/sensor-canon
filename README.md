# sensor-canon

[![npm](https://img.shields.io/npm/dm/localeval.svg?maxAge=2592000)](https://www.npmjs.com/package/sensor-canon)
[![npm](https://img.shields.io/npm/dt/express.svg?maxAge=2592000)](https://www.npmjs.com/package/sensor-canon)

Fire a scheduled time series of (johnny-five) sensor data against any RESTful API.

![johnny-fire](/img/sensor-canon.gif)


## Install

```js
$ npm install --save sensor-canon
```


## Why this module?

Thanks to fantastic [johnny-five](http://johnny-five.io), collecting sensor data with JavaScript/Node.js is a piece of cake. However, I found myself struggling to turn sensor data into a scheduled time series for efficient storage in a database. The sensor-canon wraps this functionality in a single class. It generates a scheduled time series of POST and/or PUT requests carrying the sensor data as payload in .json format . The idea is to fire these requests against POST/PUT endpoints wired up to a object-oriented database like MongoDB.

There are currently 2 options of how to send (and store) the data:

- Data from each scheduled sensor read can be send as POST request and (on the receiving end) inserted as a separate MongoDB document. This approach is efficient enough for applications with a small number of sensors as well as low insert and query frequencies.

- The sensor-canon can also: first send POST requests carrying appropriately shaped placeholder data for pre-allocation to MongoDB and, subsequently, send PUT requests carrying real sensor data for updating the pre-allocated documents. This approach can drastically increases MongoDB performance and allows applications involving thousands of sensors as well as high update and query frequencies. Check out [this post by Sandeep Parikh and Kelly Stirman](http://blog.mongodb.org/post/65517193370/schema-design-for-time-series-data-in-mongodb) and [these talks](https://www.mongodb.com/presentations/mongodb-time-series-data-part-1-setting-stage-sensor-management) to get an example.

The frequencies of both, pre-allocation (POST) and update (PUT) requests are set using cron expressions. The sensor-canon uses [cron-parser](https://github.com/harrisiirak/cron-parser) and [node-schedule](https://github.com/node-schedule/node-schedule) for generation of correctly shaped pre-allocation data and for scheduling.


## Usage

First require johnny-five and the sensor-canon and instantiate a new johnny-five board.

```js
const five = require('johnny-five')
const Canon = require('sensor-canon')

const board = new five.Board()
```

Next, instantiate a single (or a bunch of) [johnny-five sensors](http://johnny-five.io/api/sensor/) as usual. If using more than one sensor, put the sensors into an array. Here we create a simple photoresistor as an example:

```js
board.on('ready', function () {
  // for this example let's assume it's a photoresistor so the
  // instance can have a cool name ;-)
  var photoresistor = new five.Sensor({
    id: 'photoresistor',
    pin: 'A1'
  })

  // more than one sensor:
  // var sensor2 = new five.Sensor({
  //   id: 'sensor2',
  //   pin: 'A2'
  // })
  // var sensorArray = [sensor1, sensor2, ...]

  // new Canon will be created here...
})
```

Now, instantiate an new canon and pass an options object specifying a sensor (or sensor array), a URL, and 1 or 2 cron expressions for setting POST and PUT frequencies. The PUT frequency is optional and should only be set when pre-allocation of placeholder data is desired.

```js
var canon = new Canon({
  sensors: photoresistor,
  URL: URL_of_your_choice,
  postFreq: '* * * * *',
  putFreq: '* * * * * *' // optional; set only when preallocation is desired
})
```

In this example a POST request with pre-allocation data is send every minute `'* * * * *'` and a PUT request carrying real sensor data is send every second `'* * * * * *'`. Consequently the pre-allocation data in the POST request contains placeholders for 60 datapoints.

For the date of writing of this documentation, the pre-allocation data (POST payload) for this example would have the following structure:

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

The \_id is a compound index of the unique sensor id and a date string specifying the current minute. The data array contains 60 placeholder objects `(time: NaN, value: NaN}` which should be included in the document that gets pre-allocated to MongoDB.

Sensor data for updating this document (PUT payload) would be structured like this:

```js
{
  _id: 'photoresistor:201606071510',  // used to find the document in MongoDB!
  data: {
    time: '20160607151023', // here: with resolution down to the second
    value: 423 //
  }
}
```

__Please note:__ The sensor-canon currently accepts only simple cron expressions with '\*' in each position) when both a POST and a PUT frequency are set. Work on supporting a wider range of cron expressions is in progress. Contributions are very welcome! The full range of cron expressions is supported when POSTing only.

The canon is now ready to fire - either once ore continuously:

```js
canon.continuousFire()
// for testing you can also do:
// canon.preallocate()
// canon.fire()
```


## Further reading

To better understand the motivation for writing the sensor-canon, have a look at my [blog post](http://blog.mongodb.org/post/65517193370/schema-design-for-time-series-data-in-mongodb), [this post by Sandeep Parikh and Kelly Stirman](http://blog.mongodb.org/post/65517193370/schema-design-for-time-series-data-in-mongodb) and [these talks](https://www.mongodb.com/presentations/mongodb-time-series-data-part-1-setting-stage-sensor-management)


## Copyright and license

Copyright 2016 Matthias Munder.  
Licensed under the [MIT license](./LICENSE).


[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
