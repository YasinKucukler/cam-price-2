#!/bin/bash
cd "$(dirname "$0")"

if ! command -v node &> /dev/null; then
  echo "HATA: Node.js bulunamadi."
  echo "Kurmak icin terminale yazin: brew install node"
  read -p "Devam etmek icin Enter'a basin..."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Bagimliliklar yukleniyor (bir kerelik)..."
  npm install
  echo ""
fi

node server.js
