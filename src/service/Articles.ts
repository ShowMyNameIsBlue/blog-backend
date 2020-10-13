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
   * @param pageviews
   * @param features {浏览量}
   */
  async uploadBlog(
    tilte: string,
    content: string,
    pageviews?: number,
    features?: any
  ) {
    // 转义某些敏感字符
    const reg1 = /\</g;
    const reg2 = /\>/g;
    tilte = tilte.replace(reg1, '&lt;').replace(reg2, '&gt;');
    content = content.replace(reg1, '&lt;').replace(reg2, '&gt;');
    const aid: string = this.utils.getUid(12, 'both');
    try {
      const sql: string = this.Db.formatSql(`insert into articles set ?`, [
        {
          tilte,
          content,
          pageviews,
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

  /**
   * 根据条件获取博文
   * @param condition 筛选条件
   * @param limit
   * @param skip
   */
  async getBlogs(condition: any, limit: number = 10, skip: number = 0) {
    // 获取可能的查询条件并格式化sql语句
    const { aid, title } = condition;
    const aidSql: string = aid
      ? this.Db.formatSql(`aid = ?`, [aid], true)
      : null;
    const titleSql: string = title
      ? this.Db.formatSql(`title = ?`, [title], true)
      : null;
    const totalSql: string = this.Db.formatSql(
      `select count(*) as total from articles where 1=1 ${
        aidSql ? `and ${aidSql}` : ''
      } ${titleSql ? `and ${titleSql}` : ''}`,
      []
    );
    try {
      const _total: any[] = await this.Db.query(totalSql);
      const { total } = _total[0];
      // 判断查询结果是否为空
      if (total && total > skip) {
        const dataSql: string = this.Db.formatSql(
          `select count(*) as total from articles where 1=1 ${
            aidSql ? `and ${aidSql}` : ''
          } ${titleSql ? `and ${titleSql}` : ''} limit ?,?`,
          [skip, limit]
        );
        const data: object = await this.Db.query(dataSql);
        return { total, data, skip, limit };
      } else {
        return {
          total,
          data: [],
          skip,
          limit
        };
      }
    } catch (e) {
      console.error(e);
      return e.code && e.msg
        ? e
        : { success: false, msg: '获取博文失败', code: 500 };
    }
  }
}
