@echo off
title Kamera Fiyat Hesaplama
echo Kamera Fiyat Hesaplama baslatiliyor...
echo.

if not exist node_modules (
  echo Bagimliliklar yukleniyor...
  npm install
  echo.
)

echo Tarayicide acilacak: http://localhost:3000
echo Bu pencereyi kapatmayin - uygulama kapanir.
echo.
start http://localhost:3000
node server.js
pause
