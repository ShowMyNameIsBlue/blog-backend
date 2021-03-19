import * as Router from 'koa-router';
import Utils from '../utils';
import CommentsService from '../service/Comments';
import Auths from '../auth';

export default class CommentsRoute {
  private router: Router;
  comments: CommentsService;
  utils: Utils;
  auth: Auths;
  constructor() {
    this.router = new Router();
    this.comments = new CommentsService();
    this.utils = Utils.getInstance();
    this.auth = new Auths();
    this.init();
  }

  init(): void {
    // 创建评论
    this.router.post('/create', async (ctx) => {
      this.utils.required(
        {
          body: ['visitor', 'mail', 'content', 'articles_aid', 'commentMeta']
        },
        ctx
      );
      const {
        visitor,
        mail,
        content,
        articles_aid,
        commentMeta,
        url
      } = ctx.body.request;
      const result = await this.comments.createComment(
        visitor,
        mail,
        content,
        articles_aid,
        commentMeta,
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

    //获取二级评论
    this.router.get('/:cid', async (ctx) => {
      this.utils.required(
        {
          params: ['cid']
        },
        ctx
      );
      let { cid, skip, limit } = ctx.params;
      skip = parseInt(skip) || 0;
      limit = parseInt(limit) || 10;
      const result = await this.comments.getComments(cid, skip, limit);
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

    //删除评论
    this.router.delete(
      '/:cid',
      this.auth.sessionAuth,
      this.auth.ownerAuth,
      async (ctx) => {
        this.utils.required(
          {
            params: ['cid']
          },
          ctx
        );
        const { cid } = ctx.params;
        const result = await this.comments.delComments(cid);
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
