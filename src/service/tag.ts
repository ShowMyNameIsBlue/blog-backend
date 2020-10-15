import DbInstance from '../database';
import Utils from '../utils';
export default class TagService {
  Db: DbInstance;
  utils: Utils;
  constructor() {
    this.Db = DbInstance.getInstance();
    this.utils = Utils.getInstance();
  }

  /**
   * 创建博文标签
   * @param name 标签名
   */
  async create(name: string) {
    try {
      const sql: string = this.Db.formatSql(`insert into tag set ? `, [
        { name }
      ]);
      const data = await this.Db.query(sql);
      return { success: true, data, code: 0 };
    } catch (e) {
      console.error(e);
      return e.code && e.msg
        ? e
        : { success: false, msg: '创建标签失败', code: 500 };
    }
  }

  /**
   * 获取标签
   * @param limit
   * @param skip
   */
  async getTags(limit: number, skip: number) {
    try {
      const totalSql: string = this.Db.formatSql(
        `select count(*) as total from tag`,
        [skip, limit]
      );
      const _total: any[] = await this.Db.query(totalSql);
      const { total } = _total[0];
      if (total && total > skip) {
        const dataSql: string = this.Db.formatSql(
          `select * from tag limit ?,?`,
          [skip, limit]
        );
        const data: object = await this.Db.query(dataSql);
        return { total, data, skip, limit };
      } else {
        return { total, data: [], skip, limit };
      }
    } catch (e) {
      console.error(e);
      return e.code && e.msg
        ? e
        : { success: false, msg: '获取标签失败', code: 500 };
    }
  }
}
