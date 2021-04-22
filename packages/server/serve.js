const path = require('path');

const { runServer } = require('file-explorer-server')


runServer((path.join(__dirname, '../../example')))