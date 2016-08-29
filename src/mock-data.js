const moment = require('moment')
const date = require('./date')
const parser = require('cron-parser')

function mockData (sensor, cronPost, cronPut) {
  // Generate mock data for preallocation
  let mockArray = new Array(dataArrayLength(cronPost, cronPut))
  mockArray.fill({time: NaN, value: NaN})

  let mockData = {
    _id: sensor.id + ':' + date.post(cronPost),
    data: mockArray
  }

  return mockData
}

function dataArrayLength (cronPost, cronPut) {
  const lenArrayDefault = getLengthArray('* * * * * *')
  const lenArrayPut = getLengthArray(cronPut)
  const lenArrayPost = getLengthArray(cronPost)
  const maxCronLen = 6
  let indexPost = maxCronLen - cronPost.split(' ').length

  /*
  If first atom of cronPost is a number, correct indexPost. Consider e.g.
  this cron expression: '30 * * * *'. The postFrequencey is every hour but
  the length of the expression - 5 - would cause a minute interval...
  */
  if (!isNaN(Number(cronPost.split(' ')[0]))) {
    indexPost -= 1
  }

  const postFactor = lenArrayDefault[indexPost] / lenArrayPost[indexPost]
  const lenArraySliced = lenArrayPut.slice(0, indexPost)

  return lenArraySliced.reduce((pre, curr) => pre * curr) * postFactor
}

function getLengthArray (cronExp) {
  const keys = [
    'second',
    'minute',
    'hour',
    'dayOfMonth',
    'month',
    'dayOfWeek'
  ]

  /*
  Cover the 'weird case' of month (month have different numbers of
  days!) by providing an options object with start and end date of
  current month. This makes sure that interval._fields.dayOfMonth has
  the correct length i.e. the correct number of days.
  */
  let options = {
    currentDate: new Date(moment().startOf('month').format('YYYY-MM-DD')),
    endDate: new Date(moment().endOf('month').format('YYYY-MM-DD'))
  }
  let interval = parser.parseExpression(cronExp, options)
  let fields = interval._fields
  let lengthArray = keys.map(x => fields[x].length)

  return lengthArray
}

module.exports = mockData
