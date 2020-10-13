import DbInstance from '../database';
export default class Auths {
  Db: DbInstance;
  constructor() {
    this.Db = DbInstance.getInstance();
  }

  // 根用户验证
  async ownerAuth(ctx: any, next: any) {
    try {
      const { user } = ctx.session;
      const { id, role } = user;
      const sql: string = DbInstance.getInstance().formatSql(
        `select * from user where id = ?`,
        [id]
      );
      const _user: any[] = await DbInstance.getInstance().query(sql);
      const _role = _user[0].role;
      if (_role !== 0 || role !== 0) {
        ctx.throw(403, '当前用户禁止访问', { data: user, code: 403 });
      }
      await next();
    } catch (e) {
      console.error(e);
      ctx.throw(500, '根用户验证失败');
    }
  }

  // 登录状态验证
  async sessionAuth(ctx: any, next: any) {
    const { user } = ctx.session;
    if (!user) ctx.throw(401, '当前用户未登录', { data: {}, code: 401 });
    await next();
  }
}

/**
 * bug
 * 该中间件内无法识别this,可能由于koa框架与TS冲突导致，未解决
 */
