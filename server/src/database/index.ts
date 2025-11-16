import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initTables } from './schema';

// 获取项目根目录（server目录）
// 在tsx运行时，__dirname指向src/database
// 从src/database向上两级就是server目录
const serverDir = path.resolve(__dirname, '../..');

const dbDir = path.join(serverDir, 'data');
const dbPath = path.join(dbDir, 'bbs.db');

console.log('数据库初始化信息:');
console.log('  __dirname:', __dirname);
console.log('  serverDir:', serverDir);
console.log('  数据库目录:', dbDir);
console.log('  数据库文件路径:', dbPath);

// 确保数据目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (!dbInstance) {
    try {
      console.log('创建数据库连接:', dbPath);
      dbInstance = new Database(dbPath);
      // 启用外键约束
      dbInstance.pragma('foreign_keys = ON');
      console.log('数据库连接成功');
    } catch (error) {
      console.error('数据库连接失败:', error);
      throw error;
    }
  }
  return dbInstance;
}

export { getDatabase };

// 延迟导出db，避免在模块加载时就创建连接
// 直接导出getDatabase函数，让调用者自己获取
export function getDb(): Database.Database {
  return getDatabase();
}

// 为了向后兼容，导出一个db对象
// 使用懒加载，避免在模块加载时就创建连接
export const db = {
  get prepare() {
    return getDatabase().prepare.bind(getDatabase());
  },
  get exec() {
    return getDatabase().exec.bind(getDatabase());
  },
  get pragma() {
    return getDatabase().pragma.bind(getDatabase());
  },
  close: () => {
    if (dbInstance) {
      dbInstance.close();
      dbInstance = null;
    }
  }
} as any;

export function initDatabase() {
  console.log('初始化数据库...');
  console.log('数据库目录:', dbDir);
  console.log('数据库文件路径:', dbPath);
  console.log('目录是否存在:', fs.existsSync(dbDir));
  
  const database = getDatabase();
  console.log('数据库连接已建立');
  
  try {
    console.log('开始创建表...');
    initTables(database);
    console.log('数据库初始化完成');
    console.log('数据库文件是否存在:', fs.existsSync(dbPath));
  } catch (error: any) {
    console.error('数据库初始化错误:', error);
    console.error('错误堆栈:', error?.stack);
    throw error;
  }
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

