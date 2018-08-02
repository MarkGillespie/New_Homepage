#!/bin/bash
uglifyjs notes.js scrapers.js utils.js --compress --mangle --output loaders.min.js
