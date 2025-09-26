# Railway 部署问题排查指南

## 当前问题
Railway 返回 502 错误："Application failed to respond"

## 可能原因
1. 环境变量配置错误
2. 依赖安装失败
3. 端口绑定问题
4. MongoDB 连接失败

## 排查步骤

### 1. 检查 Railway 环境变量
在 Railway 项目设置中确认以下环境变量已正确配置：

```
MONGODB_URI=mongodb+srv://wangshiyang000_db_user:<db_password>@cluster0.2uxwl07.mongodb.net/resumeai?retryWrites=true&w=majority
NODE_ENV=production
PORT=3001
```

**注意**：将 `<db_password>` 替换为实际的数据库密码

### 2. 检查 Railway 部署日志
1. 进入 Railway 控制台
2. 选择你的项目
3. 点击 "Deployments" 标签
4. 查看最新的部署日志，寻找错误信息

### 3. 验证 MongoDB 连接
在本地测试 MongoDB 连接：
```bash
# 替换为你的实际密码
MONGODB_URI="mongodb+srv://wangshiyang000_db_user:你的密码@cluster0.2uxwl07.mongodb.net/resumeai?retryWrites=true&w=majority"
```

### 4. 检查 Railway 端口配置
确保 Railway 的网络配置正确：
- 端口：3001
- 协议：HTTP

### 5. 重新部署
如果以上步骤都正确，尝试重新部署：
1. 在 Railway 控制台点击 "Redeploy"
2. 选择 "Clear build cache and redeploy"

## 紧急解决方案

如果 Railway 持续出现问题，可以考虑以下替代方案：

### 方案 A：使用 Vercel 部署后端
1. 将 server 目录单独部署到 Vercel
2. 使用 Vercel 的无服务器函数

### 方案 B：使用本地开发环境
暂时使用本地开发环境进行测试：
```bash
cd server
npm install
npm run dev
```

## 联系支持
如果问题持续存在，请联系 Railway 支持并提供部署日志。