const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const serverDir = process.cwd();
const dbDir = path.join(serverDir, 'data');
const dbPath = path.join(dbDir, 'bbs.db');

console.log('当前工作目录:', process.cwd());
console.log('数据库目录:', dbDir);
console.log('数据库文件路径:', dbPath);
console.log('目录是否存在:', fs.existsSync(dbDir));

// 确保目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('目录已创建');
}

try {
  console.log('\n尝试创建数据库连接...');
  const db = new Database(dbPath);
  console.log('✅ 数据库连接成功');
  
  db.pragma('foreign_keys = ON');
  console.log('✅ 外键约束已启用');
  
  // 创建用户表
  console.log('\n创建用户表...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ 用户表创建成功');
  
  // 测试插入
  console.log('\n测试插入用户...');
  const insert = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
  const result = insert.run('testuser', 'test@example.com', 'hashedpassword');
  console.log('✅ 用户插入成功, ID:', result.lastInsertRowid);
  
  // 测试查询
  console.log('\n测试查询用户...');
  const select = db.prepare('SELECT * FROM users WHERE username = ?');
  const user = select.get('testuser');
  console.log('✅ 用户查询成功:', user);
  
  db.close();
  console.log('\n✅ 所有测试通过！数据库文件:', dbPath);
  console.log('数据库文件存在:', fs.existsSync(dbPath));
} catch (error) {
  console.error('\n❌ 错误:', error.message);
  console.error('错误堆栈:', error.stack);
  process.exit(1);
}

