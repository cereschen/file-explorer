const { spawn, exec } = require('child_process')
const path = require('path');
const isWin = process.platform == 'win32'

const command = spawn(`yarn${isWin ? '.cmd' : ''}`,
  ["run", "preview"],
  {
    "env": { FORCE_COLOR: true },
    cwd: path.resolve(__dirname, 'packages/client'),
  })

const command1 = spawn('node',
  ["packages/server/serve.js"],
  {
    "env": { FORCE_COLOR: true },
  })
command.stdout.on('data', function (data) {
  console.log(data.toString());
});
command1.stdout.on('data', function (data) {
  console.log(data.toString());
});

exec('start http://127.0.0.1:5000');