import * as fs from 'fs';
import * as path from 'path';

/**
 * 将数据库文件复制到编译后的disk相应路径下
 */
const source: string = path.resolve(__dirname, '../src/database/models');
const target: string = path.resolve(__dirname, './src/database/models');

const sourceFiles: string[] = fs.readdirSync(source);
const targetFiles: string[] = fs.readdirSync(target);

const missFiles: string[] = [];

sourceFiles.forEach((v) => {
  if (targetFiles.indexOf(v) == -1) {
    missFiles.push(v);
  }
});
missFiles.forEach((v) => {
  fs.createReadStream(path.resolve(source, v)).pipe(
    fs.createWriteStream(path.resolve(target, v))
  );
});
