import DbInstance from '../database';
import Utils from '../utils';
export default class CategoryService {
  Db: DbInstance;
  utils: Utils;
  constructor() {
    this.Db = DbInstance.getInstance();
    this.utils = Utils.getInstance();
  }

  /**
   * 创建博文分类
   * @param name 类名
   */
  async create(name: string) {
    try {
      const sql: string = this.Db.formatSql(`insert into category set ? `, [
        { name }
      ]);
      const data = await this.Db.query(sql);
      return { success: true, data, code: 0 };
    } catch (e) {
      console.error(e);
      return e.code && e.msg
        ? e
        : { success: false, msg: '创建分类失败', code: 500 };
    }
  }

  /**
   * 获取分类
   * @param limit
   * @param skip
   */
  async getCategory(limit: number, skip: number) {
    try {
      const totalSql: string = this.Db.formatSql(
        `select count(*) as total from category`,
        [skip, limit]
      );
      const _total: any[] = await this.Db.query(totalSql);
      const { total } = _total[0];
      if (total && total > skip) {
        const dataSql: string = this.Db.formatSql(
          `select * from category limit ?,?`,
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
        : { success: false, msg: '获取分类失败', code: 500 };
    }
  }

  /**
   * 更新分类
   * @param newName  新分类名
   * @param oldName 旧分类名
   */
  async updateCategory(newName: string, oldName: string) {
    const conn: any = await this.Db.getConnection();
    try {
      await conn.beginTransactionAsync();
    } catch (e) {
      console.error(e);
      return { success: false, code: 500, msg: '设置删除事务失败' };
    }
    try {
      const updateCategory: string = this.Db.formatSql(
        `update category set name = ? where  name =?`,
        [newName, oldName]
      );
      const updateArticles_Category: string = this.Db.formatSql(
        `update articles_category set category_name = ? where  category_name =?`,
        [newName, oldName]
      );
      const _updateCategory: object = this.Db.query(updateCategory);
      const _updateArticles_Category: object = this.Db.query(
        updateArticles_Category
      );
      // 操作成功后提交事务
      await conn.commitAsync();
      return {
        success: true,
        data: {
          category: _updateCategory,
          articles_Category: _updateArticles_Category
        },
        code: 0
      };
    } catch (e) {
      console.error(e);
      // 出现异常回滚事务
      await conn.rollbackAsync();
      return e.code && e.msg
        ? e
        : { success: false, msg: '更新分类失败', code: 500 };
    }
  }

  /**
   * 删除分类
   * @param name  分类名
   */
  async delCategory(name: string) {
    const conn: any = this.Db.getConnection();
    try {
      conn.beginTransactionAsync();
    } catch (e) {
      console.error(e);
      return { success: false, code: 500, msg: '设置删除事务失败' };
    }
    try {
      const delCategory: string = this.Db.formatSql(
        `delete from where name = ?`,
        [name]
      );
      // 删除分类后将起相关联博文归为其它类
      const updateArticles_category: string = this.Db.formatSql(
        `update articles_category set category_name=? where category_name =?`,
        ['其它', name]
      );
      const _delCategory: object = this.Db.query(delCategory);
      const _updateArticles_category: object = this.Db.query(
        updateArticles_category
      );
      await conn.commitAsync();
      return {
        success: true,
        data: {
          category: _delCategory,
          articles_category: _updateArticles_category
        },
        code: 0
      };
    } catch (e) {
      // 出现异常回滚事务
      await conn.rollbackAsync();
      return e.code && e.msg
        ? e
        : { success: false, msg: '删除分类失败', code: 500 };
    }
  }
}
