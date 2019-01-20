#! /bin/sh
set -eux

if test ! -z ${CI:-}
then
  test ! -z $CC_TEST_REPORTER_ID
  curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
  chmod +x ./cc-test-reporter
  ./cc-test-reporter before-build
fi

tslint -p . --fix || true
tsc
nyc --reporter=lcov ava
nyc check-coverage --lines 100
stryker run
tslint -p .

if test ! -z ${CI:-}
then
  # If build fails, this will never run, so can hard code 0
  ./cc-test-reporter after-build --exit-code 0
  git diff --exit-code
fi
