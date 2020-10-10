import * as Router from 'koa-router';
import UserRoute from './user';
export default class RouterObj {
  prefix: string;
  private router: any;
  user: UserRoute = new UserRoute();
  constructor(prefix: string = '/api/v0') {
    this.prefix = prefix;
    this.router = new Router({ prefix });
    this.init();
  }

  init() {
    this.router.use(
      '/user',
      this.user.getRouter().routes(),
      this.user.getRouter().allowedMethods()
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
