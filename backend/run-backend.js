const fs = require('fs');
const path = require('path');

// Intercept stdout
const logFile = path.join(__dirname, 'backend-direct.log');
fs.writeFileSync(logFile, 'Starting backend redirect...\n');

function log(msg) {
  fs.appendFileSync(logFile, msg + '\n');
}

// Redirect console.log and process.stdout.write
const originalWrite = process.stdout.write;
process.stdout.write = function(chunk, encoding, callback) {
  fs.appendFileSync(logFile, chunk);
  return originalWrite.apply(process.stdout, arguments);
};

const originalErrWrite = process.stderr.write;
process.stderr.write = function(chunk, encoding, callback) {
  fs.appendFileSync(logFile, 'ERR: ' + chunk);
  return originalErrWrite.apply(process.stderr, arguments);
};

console.log = function(...args) {
  log(args.join(' '));
};

// Start the app
require('./dist/main.js');
