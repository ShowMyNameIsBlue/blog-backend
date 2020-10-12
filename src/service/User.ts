import DbInstance from '../database';
import Utils from '../utils';
export default class UserService {
  Db: DbInstance;
  utils: Utils;
  constructor() {
    this.Db = DbInstance.getInstance();
    this.utils = Utils.getInstance();
  }

  /**
   * 登录
   * @parm {username,password}
   */
  async login(username: string, password: string, role: number = 0) {
    const result = await this.checkPassword(username, password, role);
    if (!result.match) return { match: false, user: {} };
    return result;
  }

  /**
   * 注册
   * @param username
   * @param password
   */
  async register(username: string, password: string) {
    const encrypted: string = this.utils.hashpassword(username, password);
    const code: string = this.utils.getUid(12, 'both');
    try {
      const sql: string = await this.Db.formatSql('insert into user set ?', [
        { username, password: encrypted, code }
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
    password: string,
    role: number
  ) {
    const sql: string = this.Db.formatSql(
      `select * from user where username=? and role=?`,
      [username, role]
    );
    const _user = await this.Db.query(sql);
    if (_user.length) {
      const user = _user[0];
      const encrypted: string = this.utils.hashpassword(username, password);
      if (user.password == encrypted) {
        delete user.password;
        return { match: true, user };
      }
    }
    return { match: false, user: {} };
  }
}
