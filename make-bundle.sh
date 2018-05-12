#! /bin/bash

# So.
#
# What's the easiest way to run a Meteor app on a server, with:
# - Automated Mongo setup and management, including oplog setup and
#   authentication.
# - Correct versions of Node and Mongo.
# - Insulation from possibly-old Debian platform libraries.
# - Listen sockets bound externally and passed in as file descriptors.
# - Ability to update to a new app version seamlessly.
# - Init scripts.
# - Convenient admin access to Mongo shell.
#
# Well, it turns out that Sandstorm has solved all these problems in its
# bundle runner / updater.
#
# And it turns out that if you take a Sandstorm bundle and simply swap out the
# Meteor part with any other Meteor app, you get all the same advantages. Yes,
# you end up with the Sandstorm backend running for no reason (it won't be
# used), but your Meteor app will run nicely.
#
# So this script does exactly that: Takes a Sandstorm bundle and swaps out the
# Sandstorm shell for the App Market. To set up the app market, install
# Sandstorm on a server, then "update" it to an app market bundle.
#
# This is how we actually run the app market in production.

set -euo pipefail

if [ $# != 2 ]; then
  echo "usage: $0 SANDSTORM_BUNDLE OUTPUT" >&2
  exit 1
fi

if [[ $1 != *.tar.xz ]]; then
  echo "input should be .tar.xz" >&2
  exit 1
fi

if [[ $2 != *.tar.xz ]]; then
  echo "output should be .tar.xz" >&2
  exit 1
fi

status() {
  printf '\033[0;34m==== '"$1"' ====\033[0m\n' >&2
}

# ====================================================================
status "unpacking sandstorm bundle"

SANDSTORM_BASE_DIR="sandstorm-0"
rm -rf "${SANDSTORM_BASE_DIR}"
tar Jxf $1


if [ ! -e "${SANDSTORM_BASE_DIR}" ]; then
  echo "bad bundle; expected to find a sandstorm-0 directory" >&2
  exit 1
fi

# ====================================================================
status "build app market"

rm -rf build
BUILD_DIR=$PWD/build

METEOR_DEV_BUNDLE=$(./find-meteor-dev-bundle.sh)

export CXX="g++ -I$METEOR_DEV_BUNDLE/include/node"
(cd app && meteor build --directory $BUILD_DIR)
(cd build/bundle/programs/server && "$METEOR_DEV_BUNDLE/bin/npm" install)

# ====================================================================
status "merging bundles"

# Overwrite sandstorm-main.js with one that doesn't do all the HTTPS stuff we don't need.
cp meteor-bundle-main.js build/bundle/sandstorm-main.js

for file in build/bundle/*; do
  rm -rf ${SANDSTORM_BASE_DIR}/$(basename $file)
  mv $file ${SANDSTORM_BASE_DIR}/$(basename $file)
done

rm -rf build

# ====================================================================
status "compressing"

rm -f $2
tar Jcf $2 "${SANDSTORM_BASE_DIR}"
rm -rf "$SANDSTORM_BASE_DIR}"
