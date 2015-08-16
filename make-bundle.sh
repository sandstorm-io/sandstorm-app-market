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

rm -rf sandstorm-0
tar Jxf $1

if [ ! -e sandstorm-0 ]; then
  echo "bad bundle; expected custom Sandstorm build" >&2
  exit 1
fi

# ====================================================================
status "build app market"

rm -rf build
BUILD_DIR=$PWD/build

(cd app && meteor build --directory $BUILD_DIR)
(cd build/bundle/programs/server && npm install)

# ====================================================================
status "merging bundles"

# HACK: inject app store settings into sandstorm-main.js
cat > build/bundle/sandstorm-main.js << __EOF__
process.env.METEOR_SETTINGS = JSON.stringify({
  public: {
    API_URL: "https://alpha-j7uny7u376jnimcsx34c.sandstorm.io"
  }
});
__EOF__
cat sandstorm-0/sandstorm-main.js >> build/bundle/sandstorm-main.js

for file in build/bundle/*; do
  rm -rf sandstorm-0/$(basename $file)
  mv $file sandstorm-0/$(basename $file)
done

rm -rf build

# ====================================================================
status "compressing"

rm -f $2
tar Jcf $2 sandstorm-0
rm -rf sandstorm-0

