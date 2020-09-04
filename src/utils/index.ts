import * as crypto from 'crypto';
import config from '../config';

export default class utils {
  ciper: any = crypto.createCipher('aes192', config.common.salt);
  hashpassword(username: string, password: string): string {
    this.ciper.update(String(username) + String(password));
    return this.ciper.final('hex');
  }
}
