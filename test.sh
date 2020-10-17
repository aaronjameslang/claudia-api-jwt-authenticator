#! /bin/sh
set -eux

# $1 --quick

if test ! -z ${CI:-}
then
  test ! -z $CC_TEST_REPORTER_ID
  curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
  chmod +x ./cc-test-reporter
  ./cc-test-reporter before-build
else
  tslint -p main --fix || true
  tslint -p test --fix || true
fi

# ## Build
tsc -p main
# ### Install locally, so tests run against pack'd code
pkg_tgz="$(npm pack)"
rm -rf package
tar -zxf ${pkg_tgz}
rm ${pkg_tgz}
# ### Build tests against package
tsc -p test


# ## Test
nyc ava

#if ! test "${1:-}" = '--quick'
#then
  #: || stryker run
#fi

tslint -p main
tslint -p test

if test ! -z ${CI:-}
then
  # If build fails, this will never run, so can hard code 0
  ./cc-test-reporter after-build --exit-code 0
  rm -r package
  git diff --exit-code
else
  rm -r package
fi
