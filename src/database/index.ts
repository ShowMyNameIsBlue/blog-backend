import * as mysql from 'mysql';
import * as path from 'path';
import * as fs from 'fs';
import config from '../config';

export default class DbInstance {
  connection: any = mysql.createConnection(config.mysql_config);
  static instance: DbInstance;
  constructor() {}

  // 格式化sql语句

  formatSql(sql: string, dataArr: any[], slient?: boolean): string {
    sql = mysql.format(sql, dataArr);
    if (!slient) console.log('FORMAT SQL : ', sql.replace(/\n/g, ' '));
    return sql;
  }

  // 执行sql语句
  query(sql: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.connection.query(sql, (err: Error, results: any) => {
        if (err) {
          console.log('------ error occured ------------');
          console.log(sql);
          console.log('---------------------------------');
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  // 初始化数据表

  async initTable(): Promise<any> {
    let models: string[] = fs.readdirSync(path.resolve(__dirname, './models'));
    for (let i in models) {
      const model: string = models[i];
      if (model.split('.')[1] === 'sql') {
        const sql: string = fs.readFileSync(
          path.resolve(__dirname, `./models/${model}`),
          'utf-8'
        );
        if (sql.length) await this.query(sql);
      }
    }
    console.log(`database:tables initialized`);
  }

  async init() {
    await this.initTable();
  }

  public static getInstance(): DbInstance {
    if (!this.instance) return new DbInstance();
    return this.instance;
  }
}
