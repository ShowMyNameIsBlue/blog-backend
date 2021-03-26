import * as Router from 'koa-router';
import Utils from '../utils';
import ArticlesService from '../service/Articles';
import * as fs from 'fs';
import Auths from '../auth';

export default class ArticlesRoute {
  private router: Router;
  article: ArticlesService;
  utils: Utils;
  auth: Auths;
  constructor() {
    this.router = new Router();
    this.article = new ArticlesService();
    this.utils = Utils.getInstance();
    this.auth = new Auths();
    this.init();
  }
  /**
   * 博客核心代码区，重点优化部分
   */
  init(): void {
    // 上传博文
    this.router.post(
      '/upload',
      this.auth.sessionAuth,
      this.auth.ownerAuth,
      async (ctx) => {
        const r: any = await this.uploadFile(ctx);
        const { title, content, tag, category } = r;
        const pageviews: number = 0;
        const result = await this.article.uploadBlog(
          title,
          content,
          tag,
          category,
          pageviews
        );
        if (result.success) {
          const { data, code } = result;
          ctx.body = {
            data,
            code
          };
        } else {
          ctx.body = {
            code: result.code,
            msg: result.msg
          };
          ctx.throw(result.code, result.msg);
        }
      }
    );

    // 获取博文
    this.router.get('/:aid', async (ctx) => {
      this.utils.required(
        {
          params: ['aid']
        },
        ctx
      );
      const { aid } = ctx.params;
      const result = await this.article.getOne(aid);
      if (result.success) {
        const { data, code } = result;
        ctx.body = {
          data,
          code
        };
      } else {
        ctx.body = {
          code: result.code,
          msg: result.msg
        };
        ctx.throw(result.code, result.msg);
      }
    });

    // 根据条件搜索博文
    this.router.get('/search/:filter', async (ctx) => {
      this.utils.required(
        {
          params: ['filter']
        },
        ctx
      );
      const filter = JSON.parse(ctx.params.filter);
      const skip = parseInt(filter.skip, 10) || 0;
      const limit = parseInt(filter.limit, 10) || 10;
      const { condition } = filter;
      const result = await this.article.getBlogs(condition, limit, skip);
      ctx.body = result;
    });

    // 删除博文
    this.router.delete(
      '/:aid',
      this.auth.sessionAuth,
      this.auth.ownerAuth,
      async (ctx) => {
        this.utils.required(
          {
            params: ['aid']
          },
          ctx
        );
        const { aid } = ctx.params;
        const result = await this.article.delBLogs(aid);
        if (result.success) {
          const { data, code } = result;
          ctx.body = {
            data,
            code
          };
        } else {
          ctx.body = {
            code: result.code,
            msg: result.msg
          };
          ctx.throw(result.code, result.msg);
        }
      }
    );

    // 更新浏览量
    this.router.post('/pageViews', async (ctx) => {
      this.utils.required(
        {
          body: ['aid']
        },
        ctx
      );
      const { aid } = ctx.request.body;
      const result = await this.article.updatePageViews(aid);
      if (result.success) {
        const { data, code } = result;
        ctx.body = {
          data,
          code
        };
      } else {
        ctx.body = {
          code: result.code,
          msg: result.msg
        };
        ctx.throw(result.code, result.msg);
      }
    });
  }

  private uploadFile(ctx: any) {
    const form = this.utils.getForm();
    return new Promise((resolve, reject) => {
      form.parse(ctx.req, function (e: Error, fields: any, files: any) {
        if (e) reject(e);
        const { title, tag, category } = fields;
        const { path } = files.file;
        const readStream = fs.createReadStream(path);
        let content: string = '';
        // 读取文件内容
        readStream.on('data', (chunk: string) => {
          content += chunk;
        });
        // 读取结束
        readStream.on('end', (chunk: string) => {
          content += chunk;
          // 读取完成后删除文件
          fs.unlinkSync(path);
          resolve({
            title,
            content,
            tag,
            category
          });
        });
        // 失败
        readStream.on('error', (err) => {
          reject(err);
        });
      });
    });
  }
  getRouter(): Router {
    return this.router;
  }
}
