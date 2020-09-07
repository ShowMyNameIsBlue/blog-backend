import * as crypto from 'crypto';

import config from '../config';

import * as formidable from 'formidable';

import * as os from 'os';

export default class Utils {
  ciper: any = crypto.createCipher('aes192', config.common.salt);

  hashpassword(username: string, password: string): string {
    this.ciper.update(String(username) + String(password));
    return this.ciper.final('hex');
  }

  getForm(path: string = os.tmpdir() + '/blog'): any {
    const form: any = new formidable.IncomingForm();
    form.uploadDir = path;
    form.keepExtensions = true;
    return form;
  }
}
