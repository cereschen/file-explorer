const { spawn } = require('child_process')
const path = require('path');
const isWin = process.platform == 'win32'

const command = spawn(`yarn${isWin ? '.cmd' : ''}`,
  ["run", "build"],
  {
    "env": { FORCE_COLOR: true },
    cwd: path.resolve(__dirname, 'packages/client'),
  })

const command1 = spawn(`yarn${isWin ? '.cmd' : ''}`,
  ["run", "build"],
  {
    "env": { FORCE_COLOR: true },
    cwd: path.resolve(__dirname, 'packages/server'),
  })
command.stdout.on('data', function (data) {
  console.log(data.toString());
});
command1.stdout.on('data', function (data) {
  console.log(data.toString());
});