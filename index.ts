import app from './app';

import DbInstance from './src/database';

import config from './src/config';

import initData from './init';

(async () => {
  let db = DbInstance.getInstance();
  await db.connection;
  await initData();
  console.log(`Http server is up and running at port ${config.common.port}`);
  const server = app.listen(config.common.port);
  process.on('SIGINT', () => {
    console.info('SIGINT signal received.');
    server.close(function (err) {
      db.connection.end();
      if (err) {
        console.error(err);
        process.exit(1);
      }
    });
  });
})();
