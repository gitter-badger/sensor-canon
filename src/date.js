const moment = require('moment')

var date = [
  'YYYY',
  'YYYYMM',
  'YYYYMMDD',
  'YYYYMMDDHH',
  'YYYYMMDDHHmm',
  'YYYYMMDDHHmmss'
]

function post (cronStrPost) {
  var lenCronPost = cronStrPost.split(' ').length
  return moment().format(date[lenCronPost - 1])
}

function put (cronStrPut) {
  var lenCronPut = cronStrPut.split(' ').length
  return moment().format(date[lenCronPut - 1])
}

module.exports.post = post
module.exports.put = put
