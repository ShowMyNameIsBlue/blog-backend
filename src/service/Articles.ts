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
   * @param title
   * @param content
   * @param pageviews
   * @param features {浏览量}
   */
  async uploadBlog(
    title: string,
    content: string,
    tag: string,
    category: string,
    pageviews?: number,
    features?: any
  ) {
    // 开启数据库事务
    const conn: any = await this.Db.getConnection();
    try {
      await conn.beginTransactionAsync();
    } catch (e) {
      console.error(e);
      return { success: false, code: 500, msg: '设置上传事务失败' };
    }
    // 转义某些敏感字符
    const reg1 = /\</g;
    const reg2 = /\>/g;
    const reg3 = /(undefined)$/g;
    title = title.replace(reg1, '&lt;').replace(reg2, '&gt;');
    content = content
      .replace(reg1, '&lt;')
      .replace(reg2, '&gt;')
      .replace(reg3, '');
    const aid: string = this.utils.getUid(12, 'both');
    try {
      // 更新标签，分类，博文表
      const sql1: string = this.Db.formatSql(`insert into articles set ?`, [
        {
          title,
          content,
          pageviews,
          aid,
          features
        }
      ]);
      const sql2: string = this.Db.formatSql(`insert into articles_tag set ?`, [
        { articles_aid: aid, tag_name: tag }
      ]);
      const sql3: string = this.Db.formatSql(
        `insert into articles_category set ?`,
        [{ articles_aid: aid, category_name: category }]
      );

      const _article = await this.Db.query(sql1);
      const _tag = await this.Db.query(sql2);
      const _category = await this.Db.query(sql3);
      const { tag_name } = _tag;
      const { category_name } = _category;

      // 操作成功后提交事务
      await conn.commitAsync();
      return {
        success: true,
        data: { tag_name, category_name, ..._article },
        code: 0
      };
    } catch (e) {
      console.error(e);
      // 出现异常回滚事务
      await conn.rollbackAsync();
      return e.code && e.msg
        ? e
        : { success: false, msg: '上传博文失败', code: 500 };
    }
  }

  /**
   * 获取特定博文
   * @param aid 博文标识
   */
  async getOne(aid: string) {
    try {
      const sql = this.Db.formatSql(
        `select a.id, a.aid,a.title,a.content,a.pageviews,a.features,ac.category_name 
        ,at.tag_name ,a.createdAt,a.updatedAt
        from articles as a join articles_category as ac on
        a.aid = ac.articles_aid join articles_tag  as at  on a.aid = at.articles_aid
        where a.aid = ?`,
        [aid]
      );
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
   * 根据条件搜索博文
   * @param condition 筛选条件
   * @param limit
   * @param skip
   */
  async getBlogs(condition: any, limit: number = 10, skip: number = 0) {
    // 获取可能的查询条件并格式化sql语句
    const { tag, title, category } = condition;
    const tagSql = tag
      ? this.Db.formatSql(`at.tag_name like ?`, [`%${tag}%`], true)
      : null;
    const categorySql = category
      ? this.Db.formatSql(`ac.category_name like ?`, [`%${category}%`], true)
      : null;
    const titleSql = title
      ? this.Db.formatSql(`a.title like ?`, [`%${title}%`], true)
      : null;
    const totalSql: string = this.Db.formatSql(
      `select count(*) as total from articles as a join articles_category 
      as ac on a.aid = ac.articles_aid join articles_tag  as at  on a.aid = at.articles_aid  where 1=1 ${
        tagSql ? `and ${tagSql}` : ''
      } ${categorySql ? `and ${categorySql}` : ''} 
      ${titleSql ? `and ${titleSql}` : ''}`,
      []
    );
    try {
      const _total: any[] = await this.Db.query(totalSql);
      const { total } = _total[0];
      // 判断查询结果是否为空
      if (total && total > skip) {
        const dataSql: string = this.Db.formatSql(
          `select a.id, a.aid,a.title,a.content,a.pageviews,a.features,ac.category_name ,
          at.tag_name ,a.createdAt,a.updatedAt from articles as a join articles_category 
          as ac on a.aid = ac.articles_aid join articles_tag  as at  on a.aid = at.articles_aid 
          where 1=1 ${tagSql ? `and ${tagSql}` : ''} ${
            categorySql ? `and ${categorySql}` : ''
          } 
          ${titleSql ? `and ${titleSql}` : ''} limit ?,?`,
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
