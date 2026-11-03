#!/bin/sh
set -eu
f=$1
[ -f "$f" ] || exit 1
t=$(mktemp)
trap 'rm -f "$t"' EXIT
strip() {
  sed -E 's/[?&]v=[0-9A-Za-z._-]+//g; s/(name="build-version" content=")[^"]*/\1/'
}
git show ":$f" | strip > "$t"
strip < "$f" | diff -q - "$t" > /dev/null
