import * as crypto from 'crypto';

import config from '../config';

import * as formidable from 'formidable';

import * as os from 'os';

// 工具类

export default class Utils {
  ciper: any = crypto.createCipheriv(
    'aes192',
    config.common.salt,
    config.common.salt
  );

  // 密码加密
  hashpassword(username: string, password: string): string {
    this.ciper.update(String(username) + String(password));
    return this.ciper.final('hex');
  }

  // 获取表单上传处理对象
  getForm(path: string = os.tmpdir() + '/blog'): any {
    const form: any = new formidable.IncomingForm();
    form.uploadDir = path;
    form.keepExtensions = true;
    return form;
  }

  // 对请求参数进行校验
  required(rules: any, ctx: any): void {
    let errors: any[];
    let key: string = Object.keys(rules)[0];
    const value: string[] = rules[key];
    let needCheck: any = ctx.request[key];
    errors = value.filter((check) => {
      if (needCheck[check] === undefined) return true;
      return false;
    });
    if (errors.length) {
      ctx.throw(412, `${errors.join(',')} is required`);
    }
  }

  // 生成唯一标识

  getUid(length: number = 16, option: string): string {
    const numbers = '0123456789';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let chars: string = '';
    let result: string = '';
    switch (option) {
      case 'number': {
        chars = numbers;
        break;
      }
      case 'letter': {
        chars = letters;
        break;
      }
      case 'both': {
        chars = numbers + letters;
        break;
      }
      default:
        chars = numbers;
    }
    while (length > 0) {
      length--;
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
}
