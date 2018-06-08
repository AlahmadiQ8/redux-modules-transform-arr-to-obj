const tests = ['00_base', '01_already-migrated']

const defineTest = require('jscodeshift/dist/testUtils').defineTest

describe('redux-modules-new-transforms-shape', () => {
  tests.forEach(test =>
    defineTest(__dirname, 'redux-modules-new-transforms-shape', null, `${test}`)
  )
})
