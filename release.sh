#! /bin/bash

set -euo pipefail

if [ ! -e "sandstorm-0.tar.xz" ] ; then
  echo "Sandstorm-0 not found. Downloading a build based on 0.191..."
  curl "https://p36t3nqi4cwxcd1smckx.oasis.sandstorm.io/sandstorm-0-v0.191.tar.xz" > sandstorm-0.tar.xz.tmp
  mv sandstorm-0.tar.xz.tmp sandstorm-0.tar.xz
fi

LAST_COMMIT_TIME="$(git log -1 --format=%ct .)"
MARKET_TAR_X_MTIME="$(date -r market.tar.xz +%s || echo 0)"
if [ "$LAST_COMMIT_TIME" -lt "$MARKET_TAR_X_MTIME" ] ; then
  echo "Skipping rebuild of market.tar.xz. To force a rebuild, run:"
  echo "  rm market.tar.xz"
else
  ./make-bundle.sh sandstorm-0.tar.xz market.tar.xz
fi

if [ "$1" = "localtest" ] ; then
  echo "We are going to run this locally on port 6082."
  echo 'Downloading Sandstorm install script...'
  TEMPDIR="$(mktemp -d /tmp/sandstorm-app-market.$(date --rfc-3339=seconds | sed 's/ /T/').XXXXXXXXXXX)"
  curl https://install.sandstorm.io/ > "$TEMPDIR/install.sh"
fi

if [ "$1" = "localtest" ] ; then
  echo "Using Sandstorm install script to install the market..."
  SANDSTORM_BASE_DIR="${TEMPDIR}/base-dir"
  CURL_USER_AGENT=testing OVERRIDE_SANDSTORM_DEFAULT_DIR="${SANDSTORM_BASE_DIR}" REPORT=no bash "${TEMPDIR}/install.sh" -d -p 6082 -u
  echo "Disabling auto-updates..."
  sed -i 's,UPDATE_CHANNEL=dev,UPDATE_CHANNEL=none,' "${SANDSTORM_BASE_DIR}/sandstorm.conf"
  echo "Starting service..."
  "${SANDSTORM_BASE_DIR}/sandstorm" start
  FULL_PATH_TO_MARKET_BUNDLE="$PWD/market.tar.xz"
  "${SANDSTORM_BASE_DIR}/sandstorm" status || true
  "${SANDSTORM_BASE_DIR}/sandstorm" stop
  cd "${SANDSTORM_BASE_DIR}"
  echo "Using Sandstorm to switch to the market..."
  "${SANDSTORM_BASE_DIR}/sandstorm" update "${FULL_PATH_TO_MARKET_BUNDLE}"
  # Running 'update' crashes Sandstorm.
  "${SANDSTORM_BASE_DIR}/sandstorm" start
  "${SANDSTORM_BASE_DIR}/sandstorm" status
  echo 'OK! Visit: http://local.sandstorm.io:6082/'
  echo 'If you like it, run:'
  echo "  ${SANDSTORM_BASE_DIR}/sandstorm stop"
  exit 0
fi

status() {
  printf '\033[0;34m==== '"$1"' ====\033[0m\n' >&2
}

status "uploading"
gce-ss copy-files market.tar.xz root@market:/root/market.tar.xz

status "updating"
gce-ss ssh market --command "sudo sandstorm update /root/market.tar.xz"
