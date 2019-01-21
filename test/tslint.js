const main = require('../main/tslint')

module.exports = {
  ...main,
  rules: {
    'no-implicit-depndencies': false
  }
}
