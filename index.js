const spawnteract = require('spawnteract');
const fs = require('fs');
const uuid = require('uuid');
const enchannel = require('enchannel-zmq-backend');

function cleanup(kernel) {
  kernel.spawn.kill();
  fs.unlink(kernel.connectionFile);
}

spawnteract.launch('python3').then(kernel => {
  console.log(`${kernel.connectionFile}:`);
  console.log(kernel.config);
  const identity = uuid.v4();
  const session = uuid.v4();

  const shell = enchannel.createShellSubject(identity, kernel.config);

  const request = {
    header: {
      username: 'jdetle',
      session,
      msg_type: 'kernel_info_request',
      msg_id: uuid.v4(),
      date: new Date(),
      version: '5.0',
    },
    metadata: {},
    parent_header: {},
    content: {},
  };

  cleanup(kernel);
}).catch(err => {
  console.error(err);
});
