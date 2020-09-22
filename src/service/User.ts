import DbInstance from '../database';
import Utils from '../utils';
export default class User {
  Db: DbInstance;
  utils: Utils;
  constructor() {
    this.Db = new DbInstance();
    this.utils = new Utils();
  }

  /**
   * 登录
   * @parm {username,passowrd}
   */
  login(username: string, passowrd: string): void {}

  // 注册
  async register(username: string, passowrd: string) {
    const encrypted: string = this.utils.hashpassword(username, passowrd);
    const code: string = this.utils.getUid(12, 'both');
    try {
      const sql: string = await this.Db.formatSql('insert into user set ?', [
        { username, passowrd: encrypted, code }
      ]);
      const _user: object = await this.Db.query(sql);
      return { success: true, data: _user, code: 0 };
    } catch (e) {
      console.error(e);
      return e.code && e.msg
        ? e
        : { success: false, msg: '注册用户失败', code: 500 };
    }
  }

  // 验证密码
  private async checkPassword(
    username: string,
    passowrd: string,
    role: number
  ) {
    const sql: string = this.Db.formatSql(
      `select password from user where username=? and role=?`,
      [{ username, role }]
    );
    const _user = await this.Db.query(sql);
    if (_user.length) {
      const user = _user[0];
      const encrypted: string = this.utils.hashpassword(username, passowrd);
      if (user.passowrd == encrypted) {
        delete user.passowrd;
        return { match: true, user };
      }
    }
    return { match: false, user: {} };
  }
}
