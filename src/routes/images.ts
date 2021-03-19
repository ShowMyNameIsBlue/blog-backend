import * as Router from 'koa-router';
import Utils from '../utils';
import ImagesService from '../service/Images';
import Auths from '../auth';

export default class ImagesRoute {
  private router: Router;
  image: ImagesService;
  utils: Utils;
  auth: Auths;
  constructor() {
    this.router = new Router();
    this.image = new ImagesService();
    this.auth = new Auths();
    this.utils = Utils.getInstance();
    this.init();
  }

  init(): void {
    // 上传图片
    this.router.post(
      '/upload',
      this.auth.sessionAuth,
      this.auth.ownerAuth,
      async (ctx) => {
        const r: any = await this.uploadFile(ctx);
        const { path } = r;
        this.utils.required(
          {
            body: ['articles_aid', 'imgOrder']
          },
          ctx
        );
        const { imgOrder, articles_aid } = ctx.request.body;
        const result = await this.image.uploadImage(
          path,
          articles_aid,
          imgOrder
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
    // 获取图片
    this.router.get('/:filter', async (ctx) => {
      this.utils.required(
        {
          params: ['filter']
        },
        ctx
      );
      const filter = JSON.parse(ctx.params.filter);
      const skip = parseInt(filter.skip, 10) || 0;
      const limit = parseInt(filter.limit, 10) || 10;
      const result = await this.image.getImages(limit, skip);
      ctx.body = result;
    });
  }

  private uploadFile(ctx: any) {
    const form = this.utils.getForm();
    return new Promise((resolve, reject) => {
      form.parse(ctx.req, function (e: Error, fields: any, files: any) {
        if (e) reject(e);
        const { path } = files.file;
        resolve({ path });
      });
    });
  }
  getRouter(): Router {
    return this.router;
  }
}
