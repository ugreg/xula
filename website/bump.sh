#!/bin/sh
set -eu

DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
IMG='png|jpg|svg|woff2|ico'

if [ -n "${1:-}" ]; then
  BUILD_VERSION=$1
else
  SHA=$(git -C "$DIR" rev-parse HEAD 2>/dev/null || echo '')
  if [ -n "$SHA" ]; then
    BUILD_VERSION=$(TZ=UTC git -C "$DIR" log -1 --date=format-local:%Y%m%d%H%M --format=%cd HEAD).$SHA
  else
    BUILD_VERSION=$(date -u +%Y%m%d%H%M)
  fi
fi

rewrite() {
  f=$1
  shift
  sed -E "$@" "$f" > "$f.tmp"
  mv "$f.tmp" "$f"
}

FILES=''
for f in "$DIR/index.html" "$DIR/style.css" "$DIR"/pages/*.html "$DIR"/pages/components/*.html "$DIR"/pages/src/*.js "$DIR"/pages/src/common/*.js "$DIR"/pages/components/src/*.js "$DIR"/src/*.js "$DIR"/src/observability/*.js; do
  [ -f "$f" ] && FILES="$FILES $f"
done

for f in $FILES; do
  rewrite "$f" \
    -e 's/(\.js)[?]v=[A-Za-z0-9._-]+/\1/g' \
    -e 's/(\.css)[?]v=[A-Za-z0-9._-]+/\1/g' \
    -e "s/(\.($IMG))[?]v=[A-Za-z0-9._-]+/\1/g"
done

for f in $FILES; do
  rewrite "$f" \
    -e "s|from '(\.{1,2}/[A-Za-z0-9._/-]+\.js)'|from '\1?v=$BUILD_VERSION'|g" \
    -e "s|import '(\.{1,2}/[A-Za-z0-9._/-]+\.js)'|import '\1?v=$BUILD_VERSION'|g"
done

for f in $FILES; do
  rewrite "$f" \
    -e "s#([\"'(])((\.\./|\./|/)?(img|font)/[A-Za-z0-9._/-]*\.($IMG))([\"')])#\1\2?v=$BUILD_VERSION\6#g"
done

rewrite "$DIR/index.html" \
  -e "s|(<meta name=\"build-version\" content=\")[^\"]*(\")|\1$BUILD_VERSION\2|" \
  -e "s|(href=\"style\.css)(\")|\1?v=$BUILD_VERSION\2|" \
  -e "s|(src=\"src/script\.js)(\")|\1?v=$BUILD_VERSION\2|"

for want in "<meta name=\"build-version\" content=\"$BUILD_VERSION\"" "href=\"style.css?v=$BUILD_VERSION\"" "src=\"src/script.js?v=$BUILD_VERSION\""; do
  if ! grep -qF "$want" "$DIR/index.html"; then
    echo "bump.sh: missing '$want' in index.html" >&2
    exit 1
  fi
done

echo "build version -> $BUILD_VERSION"
