const parser = require('cron-parser')
const validUrl = require('valid-url')

module.exports = function verify (opt) {
  /*
  are all required options set?
  */
  if (opt.sensors === undefined ||
    opt.targetUrl === undefined ||
    opt.postFreq === undefined) {
    throw new ReferenceError('Make sure all required options are passed!')
  }

  /*
  if a single sensor is passed, put it into an array...
  */
  let sensors = opt.sensors
  if (!Array.isArray(sensors)) {
    sensors = [sensors]
  }

  /*
  Are sensors valid johnny-five sensors? Only checking for board property right now... Make more strigent...
  */
  if (!sensors.every(element => !!element.board)) {
    throw new ReferenceError('Provided sensor is not a valid johnny-five sensor')
  }

  /*
  Is URL a valid?
  */
  if (!validUrl.isHttpUri(opt.targetUrl)) {
    throw new TypeError('Not a valid URL')
  }

  /*
  Distinguish the 2 scenarios: POST only vs. POST and PUT
  */
  const both = !!opt.postFreq && !!opt.putFreq

  const isValidAtom = (atom) => {
    const splitAtom = atom.split('/')
    if (atom.length === 1 && atom === '*') {
      return
    } else if (splitAtom.length === 2 && splitAtom[0] === '*' && !isNaN(Number(splitAtom[1]))) {
      return
    } else {
      const errorMessage = `Invalid atom: '${atom}'`
      throw new RangeError(errorMessage)
    }
  }

  const verifyCronExpression = (cronExpression) => {
    /*
    Make use of cron-parsers validation
    */
    parser.parseExpression(cronExpression)
    /*
    Split into atoms and verify each
     */
    const atoms = cronExpression.split(' ')
    atoms.forEach(isValidAtom)
    /*
    Validate Length of cron expression; not done by cron-parser...
    */
    if (atoms.length > 6) {
      throw new RangeError('Cron Expression too long (more than 6 atoms)!')
    }
  }

  if (both) {
    /*
    PUT frequency must be lower than POST frequeny
    */
    if (opt.postFreq.length > opt.putFreq.length) {
      throw new RangeError('POST frequency is higher than PUT frequency. This makes no sense.')
    }
    verifyCronExpression(opt.postFreq)
    verifyCronExpression(opt.putFreq)
  } else {
    verifyCronExpression(opt.postFreq)
  }
}
