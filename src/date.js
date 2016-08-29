const moment = require('moment')

var date = [
  'YYYY',
  'YYYYMM',
  'YYYYMMDD',
  'YYYYMMDDHH',
  'YYYYMMDDHHmm',
  'YYYYMMDDHHmmss'
]

const post = (postFreq) => {
  let postFreqLength = postFreq.split(' ').length
  return moment().format(date[postFreqLength - 1])
}

const put = (putFreq) => {
  let putFreqLength = putFreq.split(' ').length
  return moment().format(date[putFreqLength - 1])
}

module.exports.post = post
module.exports.put = put
