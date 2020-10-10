import App from './app';

import DbInstance from './src/database';

import config from './src/config';

import initData from './init';

class ProcessObj {
  app: App;
  db: DbInstance;
  constructor() {
    this.app = new App();
    this.db = new DbInstance();
    this.init();
  }

  async init() {
    // 获取app实例
    const appInstance = this.app.getApp();
    // 链接数据库
    await this.db.connection;
    // 初始化数据表
    await initData();
    console.log(`Http server is up and running at port ${config.common.port}`);
    // 启动服务
    const server = appInstance.listen(config.common.port);
    // 监听服务
    process.on('SIGINT', () => {
      console.info('SIGINT signal received.');
      server.close(function (err) {
        this.db.connection.end();
        if (err) {
          console.error(err);
          process.exit(1);
        }
      });
    });
  }
}

(() => {
  new ProcessObj();
})();
