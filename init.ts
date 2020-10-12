import DbInstance from './src/database';
export default async () => {
  try {
    // 初始化数据库
    console.log('initializing database...');
    let db = DbInstance.getInstance();
    db.init();
  } catch (error) {
    console.log('init database failed');
    console.log(error);
  }
};
