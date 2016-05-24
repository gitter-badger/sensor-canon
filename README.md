# sensor-canon

Fire a scheduled time series of (johnny-five) sensor data against any RESTful API exposing a POST and a PUT route wired up to mongodb.

---

## Install

```
$ npm install sensor-canon
```

## Why this package

One of the most common use cases for sensors is the collection of time-series of data. Such time series of data can be very efficiently stored in and retrieved from a MongoDB. Inspired by this [article on the MongoDB blog](http://blog.mongodb.org/post/65517193370/schema-design-for-time-series-data-in-mongodb) and series of [talks on MongoDBWorld](https://www.mongodb.com/presentations/mongodb-time-series-data-part-1-setting-stage-sensor-management), I set out to test these ideas with some [johnny-five](http://johnny-five.io/) controlled sensors and an express app wired up to a MongoDB.

Turns out that by far the hardest part was to generate a scheduled and synchronous time series of mock data for preallocation (POST requests) and sensor data for updating the preallocated documents (PUT requests).

That's why I decided to share that code in a module. So here it is: the __sensor-canon__.

If you are interested in the complete application I came up with please read my  post [on my blog](http://matthiasmunder.de/2016/05/10/restful-banana/) or on [Medium](). Here I am only documenting the sensor side of the story.

__Disclaimer:__

I am new to programming and this is my first npm module and one of the first things I dare putting into the wild. Therefore I sure af did stupid things and made mistakes. I am here to learn and improve so please tell about it - just be nice and friendly, ok? Thanks!

## Usage

First require johnny-five and sensor-canon and instantiate a board:

```js
var five = require('johnny-five')
var Canon = require('sensor-canon')
var board = new five.Board()
```

Then instantiate a bunch of johnny-five sensors as usual and put them into an array:

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

Do not set a `freq` value when generating the sensors - sensors should emit data with maximum frequency. The frequency of data collection is set (scheduled) with [node-schedule](https://github.com/node-schedule/node-schedule) later.

Next, instantiate a new sensor canon...

```js
var canon = new Canon()
```
... and get it ready to fire. You do this by calling the canon's `load()` method and passing the sensor array, a preallocation (POST) frequency and a  data collection (PUT) frequency as parameters:

```js
canon.load(sensorArray, 'hour', 'minute')
```
For simplicity only a limited number of preallocation/read frequencies are supported at the moment. These are:

| Preallocation (POST) every:| Read (PUT) every:       |
| ---------------------------|-------------------------|
| `'minute'`                 | `'second'`              |
| `'hour'`                   | `'second'` or `'minute'`|
| `'day'`                    | `'minute'` or `'hour'`  |
| `'month'`                  | `'hour'` or `'day'`     |
| `'year'`                   | `'day'` or `'month'`    |
You can also use `'s'`, `'m'`, `'H'`, `'D'`, `'M'`, `'Y'` instead of `'second'`, `'minute'`, `'hour'`, `'day'`, `'month'`, `'year'` for convenience.

Loading the canon generates an array of sensor Promises which can be accessed as (TEST WHETHER THE PROMISE RETURNS THE SENSOR DATA GENERATED WHEN THEN IS CALLED!!!)

The canon is now ready to fire and you can test preallocation and read (put) You can either initiate single preallocation (POST) and (subsequently!) a fire (read and PUT)




[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
