import * as Router from 'koa-router';
import Utils from '../utils';
import CategoryService from '../service/Category';
export default class CategoryRoute {
  private router: Router;
  category: CategoryService;
  utils: Utils;
  constructor() {
    this.router = new Router();
    this.category = new CategoryService();
    this.utils = Utils.getInstance();
    this.init();
  }
  init(): void {
    // 创建分类
    this.router.post('/create', async (ctx) => {
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
    });
  }

  getRouter(): Router {
    return this.router;
  }
}
