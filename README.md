# sensor-canon

Fire a scheduled time series of johnny-five sensor data against any RESTful API exposing a POST and a PUT route wired up to MongoDB.

![johnny-fire](/img/sensor-canon.gif)

## Install

```js
$ npm install sensor-canon
```

## Why this package?

One of the most common use cases for sensors is the collection of time-series of data. MongoDB is an excellent choice for storing such time-series of data  ([see this blog post](http://blog.mongodb.org/post/65517193370/schema-design-for-time-series-data-in-mongodb) and these [talks recorded at MongoDBWorld](https://www.mongodb.com/presentations/mongodb-time-series-data-part-1-setting-stage-sensor-management)).

While testing the presented ideas with some [johnny-five](http://johnny-five.io/) sensors, I found that by far the hardest part was to generate a scheduled and synchronous stream of POST requests for the preallocation of correctly shaped mock data as well as a scheduled and synchronous stream of PUT requests for updating the preallocated documents with real sensor data.

That's why I decided to wrap up that code in a single class - `Canon` - and share it as a node module.

If you are interested in a sample application using the sensor-canon have a look at [my blog](http://matthiasmunder.de/2016/05/10/restful-banana/) or my post on [Medium]().

__Disclaimer:__

I am new to programming and this is my first npm module and one of the first things I dare putting into the wild. Therefore I for sure did stupid things and made silly mistakes. I am here to learn and improve so please tell about it! Just be nice and polite, ok? Thanks!

## API

| Property/ method        |  returns                     |
| ------------------------|------------------------------|
| `.targetURL`            | `String`: the target URL     |
| `.lookups`              | `Object`: the target URL     |



## Usage

First require johnny-five and the sensor-canon. Then instantiate a new johnny-five board and a new canon.

```js
const five = require('johnny-five')
const Canon = require('sensor-canon')

const board = new five.Board()
const canon = new Canon()
```

Then instantiate a single (or a bunch of) [johnny-five sensors](http://johnny-five.io/api/sensor/) as usual. If using more than one sensor, put the sensors into an array. You can pass a single sensor or an array of sensors to the canon's load() method later.

```js
board.on('ready', function () {
  var sensor1 = new five.Sensor({
    id: 'sensor1',
    pin: 'A1'
  })

  var sensor2 = new five.Sensor({
    id: 'sensor2',
    pin: 'A2'
  })

  // etc...

  var sensorArray = [sensor1, sensor2, ...]
})
```

Johnny five's Sensor class is very generic and many sensors are supported (see list at the bottom of [this page](http://johnny-five.io/api/sensor/). All Sensor instances emit 'data' events at a certain frequency. Do not set this `freq:` property when creating the sensors! Sensors should emit data events at the default frequency (25 ms). The actual frequency of data collection is set (scheduled) with [node-schedule](https://github.com/node-schedule/node-schedule) inside of the canon.

Many other sensors are supported but are represented by different classes with more diverse APIs. All of them (?), however, return the raw data from the sensor as `this.value`. The sensor-canon can handle those as well. The following example of the [Thermometer class](http://johnny-five.io/examples/temperature-htu21d/) will work:

```js
var temperature = new five.Thermometer({
    controller: "HTU21D"
  })
```

If you want to get more meaningful values from these sensors, add an additional `valusAs:` property to the object that is passed to the constructor. Let's say you want to get the temperature in celsius in the above example, this would look like:

```js
var temperature = new five.Thermometer({
    controller: "HTU21D",
    valueAs: 'celsius'
  })
```

like for example this temperature or example a However, if you want to get a more meaningful number

Next, instantiate a new sensor canon as follows:

```js
var canon = new Canon()
```

In principle many different Canon instances can be instantiated - allowing you to fire a different set of sensors against different RESTful API's, with different preallocation and read frequencies and so on...

Here we get one canon ready to fire by calling the canon's `load()` method and passing the sensor array, a target URL, a preallocation (POST) frequency and a read (PUT) frequency as parameters. The POST frequency determines how often a new document is __created__ in the MongoDB wired up to the POST route of the target URL. The PUT frequency determines how often this document is __updated__ with real sensor data.

```js
canon.load(sensorArray, URL, 'hour', 'minute')
```

For simplicity only a limited number of preallocation/read (POST/PUT) frequencies are supported at the moment. Passing any other combination will throw an error! Supported are:

| Preallocation (POST) every:| Read (PUT) every:       |
| ---------------------------|-------------------------|
| `'minute'`                 | `'second'`              |
| `'hour'`                   | `'second'` or `'minute'`|
| `'day'`                    | `'minute'` or `'hour'`  |
| `'month'`                  | `'hour'` or `'day'`     |
| `'year'`                   | `'day'` or `'month'`    |

You can also use `'s'`, `'m'`, `'H'`, `'D'`, `'M'`, `'Y'` instead of `'second'`, `'minute'`, `'hour'`, `'day'`, `'month'`, `'year'` for convenience.

The canon is now ready to fire and you can be tested:

```js
// A URL can be passed as an optional parameter
canon.preallocate(URL)
canon.fire(URL)
```

or fired continuously:

```js
// A URL can be passed as an optional parameter
canon.continuousFire(URL)
```

To see the canon in action in a little dashboard app have a look at [this post]((http://matthiasmunder.de/2016/05/10/restful-banana/)).

## Copyright and license

Copyright 2016 Matthias Munder.
Licensed under the [MIT license](./LICENSE).


[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
