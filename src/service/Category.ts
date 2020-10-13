import DbInstance from '../database';
import Utils from '../utils';
export default class CategoryService {
  Db: DbInstance;
  utils: Utils;
  constructor() {
    this.Db = DbInstance.getInstance();
    this.utils = Utils.getInstance();
  }

  /**
   * 创建博文分类
   * @param name 类名
   */
  async create(name: string) {
    try {
      const sql: string = this.Db.formatSql(`insert into category set ? `, [
        { name }
      ]);
      const data = await this.Db.query(sql);
      return { success: true, data, code: 0 };
    } catch (e) {
      console.error(e);
      return e.code && e.msg
        ? e
        : { success: false, msg: '创建分类失败', code: 500 };
    }
  }
}
