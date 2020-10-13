import * as Router from 'koa-router';
import Utils from '../utils';
import TagService from '../service/tag';
export default class TagRoute {
  private router: Router;
  tag: TagService;
  utils: Utils;
  constructor() {
    this.router = new Router();
    this.tag = new TagService();
    this.utils = Utils.getInstance();
    this.init();
  }
  init(): void {
    // 创建标签
    this.router.post('/create', async (ctx) => {
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
    });
  }

  getRouter(): Router {
    return this.router;
  }
}
