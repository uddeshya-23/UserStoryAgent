#!/bin/bash

# Create a build directory
rm -rf build
mkdir -p build/icons

# Determine which manifest to use
if [ -f "manifest.dev.json" ] && [ "$NODE_ENV" = "development" ]; then
  cp manifest.dev.json build/manifest.json
else
  cp manifest.json build/
fi

# Copy files
cp popup.html build/
cp popup.js build/
cp popup.css build/
cp options.html build/
cp options.js build/
cp options.css build/
cp background.js build/
cp -r lib build/

# Copy icons
cp icons/* build/icons/

# Create zip file (only in production)
if [ "$NODE_ENV" != "development" ]; then
  cd build
  zip -r ../jira-story-generator.zip *
  cd ..
  echo "Extension packaged as jira-story-generator.zip"
else
  echo "Development build created in ./build"
fi