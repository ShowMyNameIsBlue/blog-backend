import * as session from 'koa-session';

import * as bodyParser from 'koa-bodyparser';

import * as statics from 'koa-static';

import { mkdirSync } from 'fs';

import * as os from 'os';

export default class Middlewares {
  private app: any;

  constructor(app: any) {
    this.app = app;
  }

  addSession(config: object = {}): void {
    this.app.use(session(config, this.app));
  }

  addBodyParser(): void {
    this.app.use(bodyParser);
  }

  addStatic(target: string = '/blog'): void {
    const path: string = os.tmpdir() + target;
    mkdirSync(path);
    this.app.use(statics(path));
  }
}
