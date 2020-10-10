import * as Koa from 'koa';

import RouterObj from './src/routes';

import Middlewares from './src/middlewares';

export default class App {
  private app: Koa;
  middlewares: Middlewares;
  routerObj: RouterObj;
  constructor() {
    this.app = new Koa();
    this.middlewares = new Middlewares(this.app);
    this.routerObj = new RouterObj();
    this.init();
  }
  init(): void {
    this.app.keys = ['qxg@blues'];
    this.middlewares.addBodyParser();
    this.middlewares.addSession({
      key: 'koa.blog.sess' /** (string) cookie key (default is koa.sess) */,
      maxAge: 86400000,
      autoCommit: true /** (boolean) automatically commit headers (default true) */,
      overwrite: true /** (boolean) can overwrite or not (default true) */,
      httpOnly: true /** (boolean) httpOnly or not (default true) */,
      signed: true /** (boolean) signed or not (default true) */,
      rolling: false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
      renew: false /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/,
      secure: false /** (boolean) secure cookie*/,
      sameSite: null
    });
    this.middlewares.addStatic();
    this.app.use(this.routerObj.getRouter().routes());
  }
  getApp(): Koa {
    return this.app;
  }
}
