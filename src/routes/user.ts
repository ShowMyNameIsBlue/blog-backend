import * as Router from 'koa-router';
import Utils from '../utils';
import UserService from '../service/User';

export default class UserRoute {
  user: UserService;
  private router: Router;
  utils: Utils;
  constructor() {
    this.router = new Router();
    this.user = new UserService();
    this.utils = Utils.getInstance();
    this.init();
  }
  /**
   * 初始化路由
   */
  init(): void {
    // 用户注册
    this.router.post('/register', async (ctx) => {
      this.utils.required(
        {
          body: ['username', 'password']
        },
        ctx
      );

      const { username, password } = ctx.request.body;
      const result = await this.user.register(username, password);
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

    // 用户登录
    this.router.post('/login', async (ctx: any) => {
      this.utils.required(
        {
          body: ['username', 'password']
        },
        ctx
      );
      const { username, password } = ctx.request.body;
      const result = await this.user.login(username, password);
      if (result.match) {
        const { user } = result;
        delete user.password;
        ctx.session.user = user;
        ctx.body = { code: 0, data: user };
      } else {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          msg: '账号或密码不正确'
        };
      }
    });
  }

  getRouter(): Router {
    return this.router;
  }
}
