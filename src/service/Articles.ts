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
      await this.Db.query(sql1);
      await this.Db.query(sql2);
      await this.Db.query(sql3);

      // 操作成功后提交事务
      await conn.commitAsync();
      return {
        success: true,
        data: {
          tag,
          category,
          title,
          content,
          pageviews,
          aid,
          features
        },
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
   * 获取特定博文详情
   * @param aid 博文标识
   */
  async getOne(aid: string) {
    try {
      // 获取博文的分类，标签和详情和评论和图片
      const sql = this.Db.formatSql(
        `select 
        a.id, a.aid,a.title,a.content,a.pageviews,a.features,a.createdAt,a.updatedAt,
        ac.category_name,
        at.tag_name,
        c.id as cid,c.visitor,c.mail,c.url,c.content as c_content,c.replyNum,c.createdAt as com_createdAt,c.updatedAt as com_updatedAt,
        i.imgPath,i.imgOrder
        from articles as a 
        left join articles_category as ac on a.aid = ac.articles_aid 
        left join articles_tag as at  on a.aid = at.articles_aid
        left join comments  as c on a.aid = c.articles_aid
        left join images as i on a.aid = i.articles_aid
        where a.aid = ?`,
        [aid]
      );
      const data = await this.Db.query(sql);
      const formatData: any = { comments: [], images: [], tags: [] };
      data.forEach((e: any) => {
        const image: any = {};
        const comment: any = {};
        const tag: any = {};
        if (e.imgPath) {
          image.imgPath;
          image.imgOrder = e.imgOrder;
          formatData.images.push(image);
        }
        if (e.cid) {
          comment.cid = e.cid;
          comment.visitor = e.visitor;
          comment.mail = e.mail;
          comment.url = e.url;
          comment.content = e.c_content;
          comment.replyNum = e.replyNum;
          comment.createdAt = e.com_createdAt;
          comment.updatedAt = e.com_updatedAt;
          formatData.comments.push(comment);
        }
        if (e.tag_name && !formatData.tags.includes(e.tag_name)) {
          tag.name = e.tag_name;
          formatData.tags.push(tag);
        }
        formatData.id = e.id;
        formatData.aid = e.aid;
        formatData.title = e.title;
        formatData.content = e.content;
        formatData.pageviews = e.pageviews;
        formatData.features = e.features;
        formatData.category = e.category_name;
        formatData.createdAt = e.createdAt;
        formatData.updatedAt = e.updatedAt;
      });
      formatData.tags = this.utils.delWeight(formatData.tags);
      return { success: true, data: formatData, code: 0 };
    } catch (e) {
      console.error(e);
      return e.code && e.msg
        ? e
        : { success: false, msg: '获取博文失败', code: 500 };
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
      `select count(*) as total from articles as a 
      left join articles_category as ac on a.aid = ac.articles_aid 
      left join articles_tag  as at  on a.aid = at.articles_aid 
      left join comments  as c on a.aid = c.articles_aid
      left join images as i on a.aid = i.articles_aid
      where 1=1 ${tagSql ? `and ${tagSql}` : ''} ${
        categorySql ? `and ${categorySql}` : ''
      } 
      ${titleSql ? `and ${titleSql}` : ''}`,
      []
    );
    try {
      const _total: any[] = await this.Db.query(totalSql);
      const { total } = _total[0];
      // 判断查询结果是否为空
      if (total && total > skip) {
        const dataSql: string = this.Db.formatSql(
          `select 
          a.id, a.aid,a.title,a.content,a.pageviews,a.features,a.createdAt,a.updatedAt,
          ac.category_name,
          at.tag_name,
          c.id as cid,c.visitor,c.mail,c.url,c.content as c_content,c.replyNum,c.createdAt as com_createdAt,c.updatedAt as com_updatedAt,
          i.imgPath,i.imgOrder
          from articles as a 
          left join articles_category as ac on a.aid = ac.articles_aid
          left join articles_tag  as at  on a.aid = at.articles_aid
          left join comments  as c on a.aid = c.articles_aid
          left join images as i on a.aid = i.articles_aid
          where 1=1 ${tagSql ? `and ${tagSql}` : ''} ${
            categorySql ? `and ${categorySql}` : ''
          } 
          ${titleSql ? `and ${titleSql}` : ''} limit ?,?`,
          [skip, limit]
        );
        const data: Array<any> = await this.Db.query(dataSql);
        const resultData: Array<any> = [];
        let aid: string = data[0].aid;
        let formatData: any = { comments: [], images: [], tags: [] };
        data.forEach((e: any) => {
          if (e.aid != aid) {
            formatData.tags = this.utils.delWeight(formatData.tags);
            resultData.push(formatData);
            aid = e.aid;
            formatData = { comments: [], images: [], tags: [] };
          }
          const image: any = {};
          const comment: any = {};
          const tag: any = {};
          if (e.imgPath) {
            image.imgPath;
            image.imgOrder = e.imgOrder;
            formatData.images.push(image);
          }
          if (e.cid) {
            comment.cid = e.cid;
            comment.visitor = e.visitor;
            comment.mail = e.mail;
            comment.url = e.url;
            comment.content = e.c_content;
            comment.replyNum = e.replyNum;
            comment.createdAt = e.com_createdAt;
            comment.updatedAt = e.com_updatedAt;
            formatData.comments.push(comment);
          }
          if (e.tag_name && !formatData.tags.includes(e.tag_name)) {
            tag.name = e.tag_name;
            formatData.tags.push(tag);
          }
          formatData.id = e.id;
          formatData.aid = e.aid;
          formatData.title = e.title;
          formatData.content = e.content;
          formatData.pageviews = e.pageviews;
          formatData.features = e.features;
          formatData.category = e.category_name;
          formatData.createdAt = e.createdAt;
          formatData.updatedAt = e.updatedAt;
        });
        resultData.push(formatData);
        return { total: resultData.length, data: resultData, skip, limit };
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

  /**
   * 删除博文
   * @param aid 博文标识
   */

  async delBLogs(aid: string) {
    const conn: any = await this.Db.getConnection();
    try {
      await conn.beginTransactionAsync();
    } catch (e) {
      console.error(e);
      return { success: false, code: 500, msg: '设置删除事务失败' };
    }
    try {
      const delArticle: string = this.Db.formatSql(
        `delete from articles where aid = ?`,
        [aid]
      );
      const delComments: string = this.Db.formatSql(
        `delete from comments where articles_aid = ?`,
        [aid]
      );
      const delReply: string = this.Db.formatSql(
        `delete from comments_reply where articles_aid = ?`,
        [aid]
      );
      const delImages: string = this.Db.formatSql(
        `delete from images where articles_aid = ?`,
        [aid]
      );
      const _article = await this.Db.query(delArticle);
      const _comments = await this.Db.query(delComments);
      const _reply = await this.Db.query(delReply);
      const _images = await this.Db.query(delImages);
      // 操作成功后提交事务
      await conn.commitAsync();
      return {
        success: true,
        data: {
          article: _article,
          comments: _comments,
          reply: _reply,
          image: _images
        },
        code: 0
      };
    } catch (e) {
      console.error(e);
      // 出现异常回滚事务
      await conn.rollbackAsync();
      return e.code && e.msg
        ? e
        : { success: false, msg: '删除博文失败', code: 500 };
    }
  }

  /**
   * 增加浏览量
   */
  async updatePageViews(aid: string) {
    try {
      const sql: string = this.Db.formatSql(
        ` update articles set pageviews =pageviews+1 where aid =? `,
        [aid]
      );
      const data: object = await this.Db.query(sql);
      return {
        success: true,
        data: data,
        code: 0
      };
    } catch (e) {
      console.error(e);
      return e.code && e.msg
        ? e
        : { success: false, msg: '增加浏览量失败', code: 500 };
    }
  }
}
