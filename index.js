const spawnteract = require('spawnteract');
const fs = require('fs');
const uuid = require('uuid');
const enchannel = require('enchannel-zmq-backend');

function cleanup(kernel, channels) {
  channels.forEach(channel => channel.complete());
  kernel.spawn.kill();
  fs.unlink(kernel.connectionFile);
}

function createMessage(session, msg_type) {
  const username = process.env.LOGNAME || process.env.USER ||
                   process.env.LNAME || process.env.USERNAME;
  return {
    header: {
      username,
      session,
      msg_type,
      msg_id: uuid.v4(),
      date: new Date(),
      version: '5.0',
    },
    metadata: {},
    parent_header: {},
    content: {},
  };
}

spawnteract.launch('python3').then(kernel => {
  console.log(`${kernel.connectionFile}:`);
  console.log(kernel.config);

  const identity = uuid.v4();
  const session = uuid.v4();
  const create = createMessage.bind(null, session);
  const request = create('kernel_info_request');
  const shell = enchannel.createShellSubject(identity, kernel.config);
  const iopub = enchannel.createIOPubSubject(identity, kernel.config);

  shell.filter(msg => msg.parent_header.msg_id === request.header.msg_id)
       .map(msg => msg.content)
       .first()
       .subscribe(content => {
         console.log(content);
         cleanup(kernel);  // Clean up the spawned process and file like before
         shell.complete(); // Close up shop on the channel
       });

  process.on('SIGINT', () => {
      cleanup(kernel, [shell, iopub]);
  });

  const executeRequest = create('execute_request');

  executeRequest.content = {
      code: 'import random\nrandom.random()',
      silent: false,
      store_history: true,
      user_expressions: {},
      allow_stdin: true,
      stop_on_error: false,
  };

  iopub.subscribe(msg => console.log('IOPUB', msg));
  shell.subscribe(msg => console.log('SHELL', msg));

  function sleep(ms) {
      return new Promise((resolve) => {
          setTimeout(() => resolve(), ms);
      });
  }

  sleep(1000).then(() => {
    shell.next(executeRequest);
  });

}).catch(err => {
  console.error(err);
});
