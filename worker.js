'use strict';
const config = require('config');
const Worker = require('core-worker').Worker;
const optimist = require('optimist');
const _ = require('lodash');

const main = () => {
  if(optimist.argv.overrides) {
    let overrides = require(optimist.argv.overrides);
    _.merge(config, overrides);
  }

  console.log('Starting Email Worker');
  let announcement = require('./announcement.json');
  let worker = new Worker("EmailWorker", announcement, {
    queue: "email",
    redis: {
      host: config.redis.host,
      port: config.redis.port
    },
    discoveryHost: config.discovery.host,
    discoveryPort: config.discovery.port,
    typeQuery: ["TenantService"]
  });

  worker.init().then(() => {
    // Announce
    worker.announce();

    worker.listen().then(() => {
      worker.on('message', (workLoad) => {
        console.log(workLoad);
      });

      worker.on('error', (err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }).catch((err) => {
    console.log(err);
  });
}


if(require.main === module) {
  main();
}
