import * as Router from 'koa-router';
import Utils from '../utils';
import LinksService from '../service/Links';
import Auths from '../auth';

export default class LinksRoute {
  private router: Router;
  link: LinksService;
  utils: Utils;
  auth: Auths;
  constructor() {
    this.router = new Router();
    this.link = new LinksService();
    this.auth = new Auths();
    this.utils = Utils.getInstance();
    this.init();
  }

  init(): void {
    // 创建友链
    this.router.post(
      '/create',
      this.auth.sessionAuth,
      this.auth.ownerAuth,
      async (ctx) => {
        this.utils.required(
          {
            body: ['name', 'url']
          },
          ctx
        );
        const { name, url, describe, logo } = ctx.request.body;
        const result = await this.link.createLink(name, url, describe, logo);
        if (result.success) {
          const { data, code } = result;
          ctx.body = {
            data,
            code
          };
        } else {
          ctx.body = {
            code: result.code,
            msg: result.msg
          };
          ctx.throw(result.code, result.msg);
        }
      }
    );

    // 获取友链
    this.router.get('/:filter', async (ctx) => {
      this.utils.required(
        {
          params: ['filter']
        },
        ctx
      );
      const filter = JSON.parse(ctx.params.filter);
      const skip = parseInt(filter.skip, 10) || 0;
      const limit = parseInt(filter.limit, 10) || 10;
      const result = await this.link.getLinks(limit, skip);
      ctx.body = result;
    });
  }

  getRouter(): Router {
    return this.router;
  }
}
