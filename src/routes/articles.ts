import * as Router from 'koa-router';
import Utils from '../utils';
import ArticlesService from '../service/Articles';
import * as fs from 'fs';
import * as Path from 'path';
import * as marked from 'marked';
export default class ArticlesRoute {
  private router: Router;
  article: ArticlesService;
  utils: Utils;
  constructor() {
    this.router = new Router();
    this.article = new ArticlesService();
    this.utils = Utils.getInstance();
    this.init();
  }
  /**
   * 博客核心代码区，重点优化部分
   */
  init(): void {
    // 上传博文
    this.router.post('/uploadBlog', async (ctx) => {
      const form = this.utils.getForm();
      //   const rendererMD = new marked.Renderer();
      //   marked.setOptions({
      //     renderer: rendererMD,
      //     gfm: true,
      //     breaks: false,
      //     pedantic: false,
      //     sanitize: false,
      //     smartLists: true,
      //     smartypants: false
      //   }); //基本设置
      const p = new Promise((resolve, reject) => {
        form.parse(ctx.req, function (e: Error, fields: any, files: any) {
          // const { features } = ctx.request.body;
          if (e) reject(e);
          console.log(fields);
          console.log(files);
          const { title } = fields;
          const { name, path } = files.file;
          let readStream = fs.createReadStream(Path.resolve(path, name));
          let content: string = '';
          // 读取文件内容
          readStream.on('data', (chunk: string) => {
            content += chunk;
          });
          // 读取结束
          readStream.on('end', (chunk: string) => {
            content += chunk;
            resolve({
              title,
              content,
              features: { watched: 0, tag: '', artType: '' }
            });
          });
          // 失败
          readStream.on('error', (err) => {
            reject(err);
          });
        });
      });
    });
  }
  getRouter(): Router {
    return this.router;
  }
}
