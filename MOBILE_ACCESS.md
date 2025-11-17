# 移动端访问指南

## 📱 快速访问

### 方法一：使用局域网 IP（推荐）

1. **确保手机和电脑连接在同一 WiFi 网络**

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **在手机浏览器访问**
   - 前端地址: `http://192.168.3.10:3000`
   - 如果 IP 地址变化，运行 `ipconfig` (Windows) 或 `ifconfig` (Mac/Linux) 查看新的 IP

### 方法二：使用内网穿透（外网访问）

如果需要在外网访问，可以使用以下工具：

#### 使用 localtunnel（免费，简单）

1. **安装 localtunnel**
   ```bash
   npm install -g localtunnel
   ```

2. **启动本地服务后，运行**
   ```bash
   lt --port 3000 --subdomain onlytalk
   ```
   会得到一个类似 `https://onlytalk.loca.lt` 的地址

3. **在手机浏览器访问该地址**

#### 使用 ngrok（需要注册）

1. **注册并安装 ngrok**: https://ngrok.com/

2. **启动本地服务后，运行**
   ```bash
   ngrok http 3000
   ```

3. **使用生成的公网地址访问**

## 🔄 清除缓存

如果发现页面没有更新，请尝试：

### 浏览器缓存
- **Chrome/Edge**: `Ctrl + Shift + R` (Windows) 或 `Cmd + Shift + R` (Mac)
- **Safari**: `Cmd + Option + R`
- 或者打开开发者工具，右键刷新按钮选择"清空缓存并硬性重新加载"

### Vite 缓存
```bash
# 停止开发服务器
# 删除 Vite 缓存
rm -rf client/node_modules/.vite  # Mac/Linux
# 或手动删除 client/node_modules/.vite 文件夹 (Windows)

# 重新启动
npm run dev
```

### 浏览器开发者工具
1. 打开开发者工具 (F12)
2. 右键刷新按钮
3. 选择"清空缓存并硬性重新加载"

## 🔧 配置说明

### 前端配置 (client/vite.config.ts)
- `host: '0.0.0.0'` - 允许外部访问
- `port: 3000` - 前端端口

### 后端配置 (server/src/index.ts)
- `listen(PORT, '0.0.0.0')` - 允许外部访问
- `port: 3001` - 后端端口

## ⚠️ 注意事项

1. **防火墙**: 确保 Windows 防火墙允许 3000 和 3001 端口的访问
2. **同一网络**: 手机和电脑必须在同一 WiFi 网络下
3. **IP 地址**: 如果路由器重启，IP 地址可能会变化，需要重新查看
4. **HTTPS**: 某些功能（如摄像头、定位）需要 HTTPS，建议使用内网穿透工具

## 🛠️ 查看本机 IP 地址

### Windows
```bash
ipconfig
# 查找 "IPv4 地址"
```

### Mac/Linux
```bash
ifconfig
# 或
ip addr show
```

## 📝 更新 IP 地址

如果 IP 地址变化，需要：
1. 查看新的 IP 地址
2. 更新 `server/src/index.ts` 中的 IP 地址（可选，仅用于显示）
3. 使用新 IP 访问



