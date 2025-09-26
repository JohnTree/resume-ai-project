# Railway 详细部署指南

## 当前问题
Railway 持续返回 502 错误，需要手动检查和配置。

## 第一步：检查 Railway 项目设置

### 1. 确认项目根目录
- 确保 Railway 项目的根目录设置为 `server/` 目录
- 如果不是，需要重新配置项目路径

### 2. 检查环境变量
在 Railway 项目设置中确认以下环境变量：

```
MONGODB_URI=mongodb+srv://wangshiyang000_db_user:你的实际密码@cluster0.2uxwl07.mongodb.net/resumeai?retryWrites=true&w=majority
NODE_ENV=production
PORT=3001
```

**重要**：将 `你的实际密码` 替换为真实的 MongoDB 密码

### 3. 检查网络配置
- 端口：3001
- 协议：HTTP

## 第二步：查看部署日志

1. 进入 Railway 控制台
2. 选择你的项目
3. 点击 "Deployments" 标签
4. 查看最新的部署日志

将日志中的错误信息截图或复制给我。

## 第三步：可能的解决方案

### 方案 A：重新创建 Railway 项目
1. 删除当前 Railway 项目
2. 重新创建项目
3. 连接 GitHub 仓库
4. 手动设置根目录为 `server/`

### 方案 B：使用替代部署平台
如果 Railway 持续有问题，可以考虑：

1. **Render.com** - 免费 Node.js 托管
2. **Heroku** - 需要信用卡验证
3. **Vercel Serverless Functions** - 无服务器部署

## 第四步：本地测试

在本地测试简化版本：
```bash
cd server
npm install
npm start
```

然后访问：http://localhost:3001/health

## 需要你提供的信息

请提供以下信息帮助我进一步排查：

1. Railway 部署日志的具体错误信息
2. 你是否确认环境变量已正确配置？
3. 项目根目录是否设置为 `server/`？

## 紧急联系方式

如果问题持续，建议：
1. 联系 Railway 官方支持
2. 考虑切换到 Render.com 或其他平台