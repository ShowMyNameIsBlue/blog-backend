import DbInstance from '../database';
import Utils from '../utils';

export default class LinksService {
  Db: DbInstance;
  utils: Utils;
  constructor() {
    this.Db = DbInstance.getInstance();
    this.utils = Utils.getInstance();
  }

  /**
   * 创建友链
   * @param name 链接名
   * @param url 链接地址
   * @param describe 链接描述
   * @param logo 链接图片
   */
  async createLink(
    name: string,
    url: string,
    describe?: string,
    logo?: string
  ) {
    try {
      const sql: string = this.Db.formatSql(`insert into links set ?`, [
        {
          name,
          url,
          describe,
          logo
        }
      ]);
      const data: object = await this.Db.query(sql);
      return { success: true, data, code: 0 };
    } catch (e) {
      console.error(e);
      return e.code && e.msg
        ? e
        : { success: false, msg: '创建友链失败', code: 500 };
    }
  }

  /**
   * 获取友链
   * @param limit
   * @param skip
   */
  async getLinks(limit: number, skip: number) {
    try {
      const totalSql: string = this.Db.formatSql(
        `select count(*) as total from links`,
        [skip, limit]
      );
      const _total: any[] = await this.Db.query(totalSql);
      const { total } = _total[0];
      if (total && total > skip) {
        const dataSql: string = this.Db.formatSql(
          `select * from links limit ?,?`,
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
        : { success: false, msg: '获取友链失败', code: 500 };
    }
  }

  /**
   * 删除友链
   * @param lid 友链id
   */
  async delLinks(lid: number) {
    try {
      const sql: string = this.Db.formatSql(`delete from links where id = ?`, [
        lid
      ]);
      const data: object = await this.Db.query(sql);
      return { success: true, data, code: 0 };
    } catch (e) {
      console.error(e);
      return e.code && e.msg
        ? e
        : { success: false, msg: '删除友链失败', code: 500 };
    }
  }
}
