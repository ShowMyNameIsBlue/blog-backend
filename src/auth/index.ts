export default class Auths {
  async ownerAuth(ctx: any, next: any) {
    await next();
  }
}
