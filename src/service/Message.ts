import DbInstance from '../database';
import Utils from '../utils';

export default class MessageService {
  Db: DbInstance;
  utils: Utils;
  constructor() {
    this.Db = DbInstance.getInstance();
    this.utils = Utils.getInstance();
  }

  /**
   * 创建留言  留言回复和评论回复用的一个数据表，articles_Id字段里面
   * 既可以放的是博文id 也可是留言id 不要被变量名误导
   * @param messager 留言人
   * @param mail 邮箱
   * @param content 内容
   * @param url 友链
   */
  async createMessage(
    messager: string,
    mail: string,
    content: string,
    url?: string
  ) {
    try {
      // 转义某些敏感字符
      const reg1 = /\</g;
      const reg2 = /\>/g;
      const reg3 = /(undefined)$/g;
      content = content
        .replace(reg1, '&lt;')
        .replace(reg2, '&gt;')
        .replace(reg3, '');
      const mid: string = this.utils.getUid(12, 'both');
      const sql: string = this.Db.formatSql(`insert into message set ?`, [
        {
          mid,
          messager,
          content,
          mail,
          url
        }
      ]);
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
        : { success: false, msg: '留言失败', code: 500 };
    }
  }

  /**
   * 获取留言
   *
   * @param limit
   * @param skip
   */
  async getMessages(skip: string, limit: string) {
    try {
      const totalSql: string = this.Db.formatSql(
        `select count(*) as total
         from message as m
         left join comments as c on m.mid = c.articles_aid`,
        []
      );
      const _total: any[] = await this.Db.query(totalSql);
      const { total } = _total[0];
      if (total && total > skip) {
        const dataSql: string = this.Db.formatSql(
          `select 
           m.id,m.mid,m.messager,m.mail,m.url,m.content,m.createdAt,m.updatedAt,
           c.id as cid,c.visitor,c.mail,c.url,c.content,c.replyNum,c.createdAt as com_createdAt,c.updatedAt as com_updatedAt,
           from message as m
           left join comments as c on m.mid = c.articles_aid`,
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
        : { success: false, msg: '获取留言失败', code: 500 };
    }
  }

  /**
   * 删除留言
   * @param mid 留言Id
   */
  async deleteMessage(mid: string) {
    const conn: any = await this.Db.getConnection();
    try {
      await conn.beginTransactionAsync();
    } catch (e) {
      console.error(e);
      return { success: false, code: 500, msg: '设置删除事务失败' };
    }
    try {
      const delMessage: string = this.Db.formatSql(
        `delete from articles where mid=?`,
        [mid]
      );
      const delComments: string = this.Db.formatSql(
        `delete from comments where  articles_aid = ?`,
        [mid]
      );
      const delReply: string = this.Db.formatSql(
        `delete from comments_reply where articles_aid = ? `,
        [mid]
      );
      const _message: object = await this.Db.query(delMessage);
      const _comments: object = await this.Db.query(delComments);
      const _reply: object = await this.Db.query(delReply);
      // 操作成功后提交事务
      await conn.commitAsync();
      return {
        success: true,
        data: {
          message: _message,
          comments: _comments,
          reply: _reply
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
}
