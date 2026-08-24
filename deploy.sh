#!/bin/sh
# Build and ship. Everything the script needs to know is the line below.
set -eu

TARGET="${DEPLOY_TARGET:-simulacra:/var/www/boil.someodd.zip/}"

cd "$(dirname "$0")"

[ -d node_modules ] || npm install
npm run build

# no --delete on purpose: the old boil.html stays where it is, and it is the
# only thing left that can still read the old app's localStorage
rsync -av dist/ "$TARGET"

cat <<'EOF'

live: https://boil.someodd.zip:8888/

The service worker serves from cache first, so a phone that already has the app
picks this build up the second time it is opened, not the first.
EOF
