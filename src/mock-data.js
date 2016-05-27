const moment = require('moment')
const parser = require('cron-parser')
const date = require('./date')

function getArrayLength (cronStrPost, cronStrPut) {
  // private variables
  var lenCronPost = cronStrPost.split(' ').length
  var lenCronPut = cronStrPut.split(' ').length
  var postIdx = 6 - lenCronPost
  var putIdx = 6 - lenCronPut
  var putFactor = NaN
  var postFactor = 1
  var propArrayPost = []
  var postInt = {}
  var putInt = {}

  /**
   * Cover the 'weird case' of month (month have different numbers of
   * days!) by providing an options object with current and end date of
   * current month. This makes sure that interval._fields.dayOfMonth has
   * the correct length i.e. the correct number of days.
   */
  if (lenCronPost === 2) {
    var options = {
      currentDate: new Date(moment().startOf('month').format()),
      endDate: new Date(moment().endOf('month').format())
    }

    postInt = parser.parseExpression(cronStrPost, options)
  } else {
    postInt = parser.parseExpression(cronStrPost)
    putInt = parser.parseExpression(cronStrPut)

    putFactor = putInt._fields[Object.keys(putInt._fields)[putIdx]].length
    propArrayPost = Object.keys(postInt._fields).slice(0, postIdx)

    propArrayPost.forEach(function (key) {
      postFactor *= postInt._fields[key].length
    })
  }
  console.log(putFactor * postFactor)
  return putFactor * postFactor
}

function mockData (sensor, cronStrPost, cronStrPut) {
  var arrayLength = getArrayLength(cronStrPost, cronStrPut)
  // Generate mock data for preallocation
  var mockArray = new Array(arrayLength)
  mockArray.fill({time: NaN, value: NaN})

  return {
    _id: sensor.id + ':' + date.post(cronStrPost),
    data: mockArray
  }
}

module.exports = mockData
