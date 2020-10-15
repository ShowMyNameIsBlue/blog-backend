import * as Router from 'koa-router';
import Utils from '../utils';
import TagService from '../service/Tag';
import Auths from '../auth';

export default class TagRoute {
  private router: Router;
  tag: TagService;
  utils: Utils;
  auth: Auths;
  constructor() {
    this.router = new Router();
    this.tag = new TagService();
    this.auth = new Auths();
    this.utils = Utils.getInstance();
    this.init();
  }
  init(): void {
    // 创建标签
    this.router.post(
      '/create',
      this.auth.sessionAuth,
      this.auth.ownerAuth,
      async (ctx) => {
        this.utils.required(
          {
            body: ['name']
          },
          ctx
        );
        const { name } = ctx.request.body;
        const result = await this.tag.create(name);
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

    // 获取标签
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
      const result = await this.tag.getTags(limit, skip);
      ctx.body = result;
    });
  }

  getRouter(): Router {
    return this.router;
  }
}
