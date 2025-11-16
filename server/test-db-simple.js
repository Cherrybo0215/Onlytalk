const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 使用绝对路径
const serverDir = __dirname;
const dbDir = path.join(serverDir, 'data');
const dbPath = path.join(dbDir, 'test.db');

console.log('当前目录:', __dirname);
console.log('数据库目录:', dbDir);
console.log('数据库文件路径:', dbPath);

// 确保目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✅ 目录已创建');
}

try {
  console.log('\n创建数据库连接...');
  const db = new Database(dbPath);
  console.log('✅ 数据库连接成功');
  
  console.log('\n创建表...');
  db.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT)');
  console.log('✅ 表创建成功');
  
  console.log('\n插入数据...');
  const stmt = db.prepare('INSERT INTO users (username) VALUES (?)');
  const result = stmt.run('testuser');
  console.log('✅ 数据插入成功, ID:', result.lastInsertRowid);
  
  console.log('\n查询数据...');
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  console.log('✅ 查询成功:', user);
  
  db.close();
  console.log('\n✅ 所有测试通过！');
  console.log('数据库文件:', dbPath);
  console.log('文件存在:', fs.existsSync(dbPath));
  console.log('文件大小:', fs.statSync(dbPath).size, 'bytes');
} catch (error) {
  console.error('\n❌ 错误:', error.message);
  console.error('错误堆栈:', error.stack);
  process.exit(1);
}

