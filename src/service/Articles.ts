import DbInstance from '../database';
import Utils from '../utils';

export default class ArticlesService {
  Db: DbInstance;
  utils: Utils;
  constructor() {
    this.Db = DbInstance.getInstance();
    this.utils = Utils.getInstance();
  }

  /**
   * 上传markdown格式博文
   * @param tilte
   * @param content
   * @param features
   */
  async uploadBlog(tilte: string, content: string, features: any) {
    const reg1 = /\</g;
    const reg2 = /\>/g;
    tilte = tilte.replace(reg1, '&lt;').replace(reg2, '&gt;');
    content = content.replace(reg1, '&lt;').replace(reg2, '&gt;');
    const aid = this.utils.getUid(12, 'both');
    try {
      const sql: string = this.Db.formatSql(`insert into articles set ?`, [
        {
          tilte,
          content,
          aid,
          features
        }
      ]);
      const _article: object = await this.Db.query(sql);
      return { success: true, data: _article, code: 0 };
    } catch (e) {
      console.error(e);
      return e.code && e.msg
        ? e
        : { success: false, msg: '上传博文失败', code: 500 };
    }
  }
}
