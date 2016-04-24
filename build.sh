#!/bin/sh
echo "Copy project files to ./build"
mkdir -p ./build
cp ui_*.html ./build/ -rf
cp *.json ./build/ -rf
cp js ./build/ -rf
cp css ./build/ -rf

echo "Copy nwjs files"
cp /cygdrive/d/software/nwjs-v0.14.2-win-x64/* ./build/ -rf