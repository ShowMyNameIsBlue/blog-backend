import * as Router from 'koa-router';
import UserRoute from './user';
import TagRoute from './tag';
import CategoryRoute from './category';
import ArticlesRoute from './articles';
import Auths from '../auth';
export default class RouterObj {
  prefix: string;
  private router: any;
  user: UserRoute;
  tag: TagRoute;
  category: CategoryRoute;
  auth: Auths;
  articles: ArticlesRoute;
  constructor(prefix: string = '/api/v0') {
    this.prefix = prefix;
    this.auth = new Auths();
    this.user = new UserRoute();
    this.tag = new TagRoute();
    this.category = new CategoryRoute();
    this.router = new Router({ prefix });
    this.articles = new ArticlesRoute();
    this.init();
  }

  init() {
    // 用户路由
    this.router.use(
      '/user',
      this.user.getRouter().routes(),
      this.user.getRouter().allowedMethods()
    );

    // 标签路由
    this.router.use(
      '/tag',
      this.auth.sessionAuth,
      this.auth.ownerAuth,
      this.tag.getRouter().routes(),
      this.tag.getRouter().allowedMethods()
    );

    // 博文分类路由
    this.router.use(
      '/category',
      this.auth.sessionAuth,
      this.auth.ownerAuth,
      this.category.getRouter().routes(),
      this.category.getRouter().allowedMethods()
    );

    // 博文路由
    this.router.use(
      '/articles',
      this.auth.sessionAuth,
      this.auth.ownerAuth,
      this.articles.getRouter().routes(),
      this.articles.getRouter().allowedMethods()
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
