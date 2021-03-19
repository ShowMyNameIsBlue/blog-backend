import * as Router from 'koa-router';
import UserRoute from './user';
import TagRoute from './tag';
import CategoryRoute from './category';
import ArticlesRoute from './articles';
import CommentsRoute from './comments';
import MessageRoute from './messages';
import ImagesRoute from './images';
import LinksRoute from './links';
import Auths from '../auth';

export default class RouterObj {
  prefix: string;
  private router: any;
  user: UserRoute;
  tag: TagRoute;
  category: CategoryRoute;
  auth: Auths;
  articles: ArticlesRoute;
  comments: CommentsRoute;
  message: MessageRoute;
  images: ImagesRoute;
  links: LinksRoute;
  constructor(prefix: string = '/api/v0') {
    this.prefix = prefix;
    this.router = new Router({ prefix });
    this.auth = new Auths();
    this.user = new UserRoute();
    this.tag = new TagRoute();
    this.category = new CategoryRoute();
    this.articles = new ArticlesRoute();
    this.comments = new CommentsRoute();
    this.images = new ImagesRoute();
    this.links = new LinksRoute();
    this.init();
  }

  init() {
    // 用户路由
    this.router.use(
      '/user',
      this.user.getRouter().routes(),
      this.user.getRouter().allowedMethods()
    );

    // 博文标签路由
    this.router.use(
      '/tag',
      this.tag.getRouter().routes(),
      this.tag.getRouter().allowedMethods()
    );

    // 博文分类路由
    this.router.use(
      '/category',
      this.category.getRouter().routes(),
      this.category.getRouter().allowedMethods()
    );

    // 博文路由
    this.router.use(
      '/articles',
      this.articles.getRouter().routes(),
      this.articles.getRouter().allowedMethods()
    );
    // 博文评论路由
    this.router.use(
      '/comments',
      this.comments.getRouter().routes(),
      this.comments.getRouter().allowedMethods()
    );
    // 留言路由
    this.router.use(
      '/comments',
      this.message.getRouter().routes(),
      this.message.getRouter().allowedMethods()
    );
    // 图片路由
    this.router.use(
      '/images',
      this.images.getRouter().routes(),
      this.images.getRouter().allowedMethods()
    );
    // 友链路由
    this.router.use(
      '/links',
      this.links.getRouter().routes(),
      this.links.getRouter().allowedMethods()
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
