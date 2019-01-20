#! /bin/sh
set -eux

# $1 --quick

if test ! -z ${CI:-}
then
  test ! -z $CC_TEST_REPORTER_ID
  curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
  chmod +x ./cc-test-reporter
  ./cc-test-reporter before-build
fi

tslint -p . --fix || true
tsc

# Install locally, so tests run against pack'd code
name=$(npm view . name)
pkg_tgz="$(npm pack)"
tar -zxf ${pkg_tgz}
rm ${pkg_tgz}

nyc --reporter=lcov ava
nyc check-coverage --lines 100

if ! test "${1:-}" = '--quick'
then
  : || stryker run
fi

tslint -p .

if test ! -z ${CI:-}
then
  # If build fails, this will never run, so can hard code 0
  ./cc-test-reporter after-build --exit-code 0
  rm -r package
  git diff --exit-code
else
  rm -r package
fi
