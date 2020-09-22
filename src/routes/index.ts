import * as Router from 'koa-router';

export default class RouterObj {
  prefix: string;
  router: any;
  constructor(prefix: string) {
    this.prefix = prefix;
    this.router = new Router({ prefix });
  }

  init() {
    this.router.use('/user');
  }
}
