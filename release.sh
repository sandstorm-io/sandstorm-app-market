#! /bin/bash

set -euo pipefail

./make-bundle.sh sandstorm-0-fast.tar.xz market.tar.xz

status() {
  printf '\033[0;34m==== '"$1"' ====\033[0m\n' >&2
}

status "uploading"
gce-ss copy-files market.tar.xz root@market:/root/market.tar.xz

status "updating"
gce-ss ssh market --command "sudo sandstorm update /root/market.tar.xz"

