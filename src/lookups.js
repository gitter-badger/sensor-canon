var arrayLength = {
  ms: 60,
  Hs: 3600,
  Hm: 60,
  Dm: 1440,
  DH: 24,
  WH: 168,
  WD: 7,
  YD: 365,
  YM: 12
}

var datePost = {
  m: 'YYMMWWDDHHmm',
  H: 'YYMMWWDDHH',
  D: 'YYMMWWDD',
  W: 'YYMMWW',
  M: 'YYMM',
  Y: 'YY'
}

var datePut = {
  s: 'YYMMDDHHmmss',
  m: 'YYMMDDHHmm',
  H: 'YYMMDDHH',
  D: 'YYMMDD',
  M: 'YYMM'
}

var cronString = {
  s: '* * * * * *',
  m: '0 * * * *',
  H: '0 * * *',
  M: '0 * *',
  Y: '0 *',
  W: '0'
}

module.exports.arrayLength = arrayLength
module.exports.datePost = datePost
module.exports.datePut = datePut
module.exports.cronString = cronString
