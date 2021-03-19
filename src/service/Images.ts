import DbInstance from '../database';
import Utils from '../utils';

export default class ImagesService {
  Db: DbInstance;
  utils: Utils;
  constructor() {
    this.Db = DbInstance.getInstance();
    this.utils = Utils.getInstance();
  }

  /**
   * 上传图片
   * @param imgPath 图片路径
   */
  async uploadImage(imgPath: string, articles_aid: string, imgOrder: number) {
    try {
      const sql: string = this.Db.formatSql(`insert into images set ?`, [
        { imgPath, articles_aid, imgOrder }
      ]);
      const data: object = await this.Db.query(sql);
      return { success: true, data, code: 0 };
    } catch (e) {
      console.error(e);
      return e.code && e.msg
        ? e
        : { success: false, msg: '创建图片失败', code: 500 };
    }
  }

  /**
   * 获取所有图片路径
   * @param limit
   * @param skip
   */
  async getImages(limit: number, skip: number) {
    try {
      const totalSql: string = this.Db.formatSql(
        `select count(*) as total from images`,
        [skip, limit]
      );
      const _total: any[] = await this.Db.query(totalSql);
      const { total } = _total[0];
      if (total && total > skip) {
        const dataSql: string = this.Db.formatSql(
          `select * from images limit ?,?`,
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
        : { success: false, msg: '获取图片失败', code: 500 };
    }
  }
}
