import DbInstance from '../database';
export default class Auths {
  Db: DbInstance;
  constructor() {
    this.Db = new DbInstance();
  }

  // 根用户验证
  async ownerAuth(ctx: any, next: any) {
    try {
      const { user } = ctx.session;
      const { role } = user;
      const sql: string = this.Db.formatSql(`select * from user where id = ?`, [
        role
      ]);
      const _user: any[] = await this.Db.query(sql);
      const _role = _user[0].role;
      if (_role !== 0) {
        ctx.throw(403, '当前用户禁止访问', { data: user, code: 1 });
      }
      await next();
    } catch (e) {
      ctx.throw(500, '根用户验证失败');
    }
  }

  // 登录状态验证
  async sessionAuth(ctx: any, next: any) {
    const { user } = ctx.session;
    if (!user) ctx.throw(401, '当前用户未登录', { data: {}, code: 1 });
    await next();
  }
}
