#!/usr/bin/env bash
# Copia los archivos del juego (static/) a docs/, que es lo que GitHub Pages
# publica. Corre esto cada vez que cambies algo en src/main/resources/static
# y antes de hacer git push.
set -e
cd "$(dirname "$0")"
rm -rf docs
mkdir -p docs
cp -r src/main/resources/static/* docs/
echo "docs/ actualizado a partir de src/main/resources/static/"
