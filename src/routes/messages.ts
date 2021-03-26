import * as Router from 'koa-router';
import Utils from '../utils';
import MessageService from '../service/Message';
import Auths from '../auth';

export default class MessageRoute {
  private router: Router;
  message: MessageService;
  utils: Utils;
  auth: Auths;
  constructor() {
    this.router = new Router();
    this.message = new MessageService();
    this.utils = Utils.getInstance();
    this.auth = new Auths();
    this.init();
  }

  init(): void {
    // 创建留言
    this.router.post('/create', async (ctx) => {
      this.utils.required(
        {
          body: ['messager', 'mail', 'content']
        },
        ctx
      );
      const { messager, mail, content, url } = ctx.request.body;
      const result = await this.message.createMessage(
        messager,
        mail,
        content,
        url
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
    });

    // 获取留言
    this.router.get('/all', async (ctx) => {
      let { skip, limit } = ctx.params;
      skip = parseInt(skip) || 0;
      limit = parseInt(limit) || 10;
      const result = await this.message.getMessages(skip, limit);
      ctx.body = result;
    });

    // 删除留言
    this.router.delete(
      '/:mid',
      this.auth.sessionAuth,
      this.auth.ownerAuth,
      async (ctx) => {
        this.utils.required(
          {
            params: ['mid']
          },
          ctx
        );
        const { mid } = ctx.params;
        const result = await this.message.deleteMessage(mid);
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
  }
  getRouter(): Router {
    return this.router;
  }
}
