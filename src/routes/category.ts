import * as Router from 'koa-router';
import Utils from '../utils';
import CategoryService from '../service/Category';
import Auths from '../auth';

export default class CategoryRoute {
  private router: Router;
  category: CategoryService;
  utils: Utils;
  auth: Auths;

  constructor() {
    this.router = new Router();
    this.category = new CategoryService();
    this.utils = Utils.getInstance();
    this.auth = new Auths();
    this.init();
  }
  init(): void {
    // 创建分类
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
        const result = await this.category.create(name);
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

    // 获取分类
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
      const result = await this.category.getCategory(limit, skip);
      ctx.body = result;
    });
  }

  getRouter(): Router {
    return this.router;
  }
}
