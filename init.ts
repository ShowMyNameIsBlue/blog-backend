import DbInstance from './src/database';

export default async () => {
  try {
    console.log('initializing database...');
    let db = DbInstance.getInstance();
    db.init();
  } catch (error) {
    console.log('init database failed');
    console.log(error);
  }
};
