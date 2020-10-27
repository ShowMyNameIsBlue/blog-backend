import DbInstance from '../database';
import Utils from '../utils';

export default class CommentsService {
  Db: DbInstance;
  utils: Utils;
  constructor() {
    this.Db = DbInstance.getInstance();
    this.utils = Utils.getInstance();
  }

  /**
   * 创建评论
   * @param commentMeta 附加信息，评论类型: 0 评论博文，1 回复评论，3 回复留言板
   * @param visitor 评论人
   * @param mail 邮箱
   * @param content 内容
   * @param url 友链
   */
  async createComment(
    commentMeta: any,
    visitor: string,
    mail: string,
    content: string,
    url?: string
  ) {
    // 开启数据库事务
    const conn: any = await this.Db.getConnection();
    try {
      await conn.beginTransactionAsync();
    } catch (e) {
      console.error(e);
      return { success: false, code: 500, msg: '设置评论事务失败' };
    }
    try {
      const sql = this.Db.formatSql(`insert into comments set ?`, [
        {
          visitor,
          mail,
          content,
          url
        }
      ]);
      const _comments = await this.Db.query(sql);
      const comments_id: number = _comments.insertId;
      const { commentType } = commentMeta;
      switch (commentType) {
        // 评论博文
        case 0:
          const { articles_aid } = commentMeta;
          const sql0: string = this.Db.formatSql(
            `insert into articles_comments set ?`,
            [
              {
                articles_aid,
                comments_id
              }
            ]
          );
          const _articles_comments = await this.Db.query(sql0);
          await conn.commitAsync();
          return {
            success: true,
            data: { _comments, _articles_comments },
            code: 0
          };
        // 回复评论
        case 1: {
          const { replay_id } = commentMeta;
          const sql1: string = this.Db.formatSql(
            `insert into comments_reply set ?`,
            [{ comments_id, replay_id }]
          );
          const _comments_reply = await this.Db.query(sql1);
          await conn.commitAsync();
          return {
            success: true,
            data: { _comments, _comments_reply },
            code: 0
          };
        }

        // 回复留言板
        case 2: {
          const sql2: string = this.Db.formatSql(`insert into message set ?`, [
            {
              comments_id
            }
          ]);
          const _message = await this.Db.query(sql2);
          await conn.commitAsync();
          return {
            success: true,
            data: { _comments, _message },
            code: 0
          };
        }
      }
    } catch (e) {
      console.error(e);
      // 出现异常回滚事务
      await conn.rollbackAsync();
      return e.code && e.msg
        ? e
        : { success: false, msg: '创建评论失败', code: 500 };
    }
  }

  /**
   * 获取留言
   * @param targetMeta 根据该参数判断是获取博文留言还是留言板留言 0 博文，1 留言板
   * @param skip
   * @param limit
   */
  async getComments(targetMeta: any, skip: number, limit: number) {
    const { type } = targetMeta;
    try {
      if (type == 0) {
        const { aid } = targetMeta;
        const totalSql: string = this.Db.formatSql(
          `select count(*) as total from articles as a join  articles_comments as ac 
          on a.aid = ac.articles_aid where a.aid = ?`,
          [aid]
        );
        const _total = await this.Db.query(totalSql);
        const { total } = _total[0];
        if (total && total > skip) {
          const commentIdSql: string = this.Db.formatSql(
            `select a.*, ac.comments_id   from articles as a join  articles_comments as ac 
            on a.aid = ac.articles_aid where a.aid = ? limit ?,?`,
            [aid, skip, limit]
          );
          const commentData = await this.Db.query(commentIdSql);
          let commentIdStr: string = '';
          commentData.forEach((e: any) => {
            const { comments_id } = e;
            commentIdStr += `or comments_id = ${comments_id}`;
          });
          const dataSql: string = this.Db.formatSql(
            `select * from comment_reply as cr `,
            []
          );
          // return { total, data, skip, limit };
        } else {
          const data: any[] = [];
          return { total, data, skip, limit };
        }
      } else {
      }
    } catch (e) {}
  }
}
