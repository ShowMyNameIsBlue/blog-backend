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
   * @param commentMeta 含有判断类型的回复信息 0 回复博文 1 回复评论
   * @param visitor 评论人
   * @param mail 邮箱
   * @param content 内容
   * @param articles_aid 博文id
   * @param url 友链
   */
  async createComment(
    visitor: string,
    mail: string,
    content: string,
    articles_aid: string,
    commentMeta: any,
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
          url,
          articles_aid
        }
      ]);
      const _comments = await this.Db.query(sql);
      const _id: number = _comments.insertId;
      const { commentType } = commentMeta;
      let _comments_reply: object = {};
      if (commentType) {
        const { comments_id } = commentMeta;
        const sql1: string = this.Db.formatSql(
          `insert into comments_reply set ?`,
          [{ replay_id: _id, comments_id, articles_aid }]
        );
        _comments_reply = await this.Db.query(sql1);
        // 更新一级评论的二级回复数量
        const sql2: string = this.Db.formatSql(
          `update comments set replyNum =replyNum+1 where id =? `,
          [comments_id]
        );
        await this.Db.query(sql2);
      }
      await conn.commitAsync();
      return {
        success: true,
        data: { _comments, _comments_reply },
        code: 0
      };
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
   * 获取某一条评论下的二级评论
   * @param cid 评论id
   * @param skip
   * @param limit
   */
  async getComments(cid: string, skip: number, limit: number) {
    try {
      const totalSql: string = this.Db.formatSql(
        `select count(*) as total from comments_reply where comments_id`,
        [cid]
      );
      const _total = await this.Db.query(totalSql);
      const { total } = _total[0];
      if (total && total > skip) {
        const replyIdSql: string = this.Db.formatSql(
          `select * from comments_reply where comments_id = ? limit ?,?`,
          [cid, skip, limit]
        );
        const allReply = await this.Db.query(replyIdSql);
        let allReplySql: string = '';
        allReply.forEach((e: any) => {
          const { replay_id } = e;
          allReplySql += `or id = ${replay_id}`;
        });
        const dataSql: string = this.Db.formatSql(
          `select * from comments where 1=1 ${allReplySql}`,
          []
        );
        const data: object = this.Db.query(dataSql);
        return { total, data, skip, limit };
      } else {
        const data: any[] = [];
        return { total, data, skip, limit };
      }
    } catch (e) {
      console.error(e);
      return e.code && e.msg
        ? e
        : { success: false, msg: '获取评论失败', code: 500 };
    }
  }

  /**
   * 删除评论 如果存在二级评论也要删除
   * @param cid 评论id
   */
  async delComments(comments_id: number) {
    const conn: any = await this.Db.getConnection();
    try {
      await conn.beginTransactionAsync();
    } catch (e) {
      console.error(e);
      return { success: false, code: 500, msg: '设置评论事务失败' };
    }
    try {
      // 获得目标评论下的所有二级评论
      const selectAllsecond = this.Db.formatSql(
        `select replay_id from comments_reply where comments_id = ?`,
        [comments_id]
      );
      const _allSecond: object[] = await this.Db.query(selectAllsecond);
      // 将查询结果拼接成字符串
      let _allSecondStr: string = '';
      _allSecond.forEach((e: any) => {
        const { comments_id } = e;
        _allSecondStr += `or id = ${comments_id}`;
      });
      // 删除所有二级评论
      const delAllSecond: string = await this.Db.formatSql(
        `delete from comments where 1=1 ${_allSecondStr}`,
        []
      );
      const _second: object = await this.Db.query(delAllSecond);
      // 删除一级评论
      const delFirst: string = await this.Db.formatSql(
        `delete from comments where id = ?`,
        [comments_id]
      );
      const _first: object = await this.Db.query(delFirst);
      await conn.commitAsync();
      return {
        success: true,
        data: {
          firstComment: _first,
          secondComment: _second
        },
        code: 0
      };
    } catch (e) {
      console.error(e);
      // 出现异常回滚事务
      await conn.rollbackAsync();
      return e.code && e.msg
        ? e
        : { success: false, msg: '删除评论失败', code: 500 };
    }
  }
}
