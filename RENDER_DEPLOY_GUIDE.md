# Render.com 部署指南

## 立即行动步骤

### 1. 注册 Render.com
- 访问 https://render.com
- 使用 GitHub 账号注册（推荐）
- 完成邮箱验证

### 2. 创建 Web Service
1. 点击 "New" → "Web Service"
2. 连接你的 GitHub 仓库：JohnTree/resume-ai-project
3. 选择仓库后点击 "Connect"

### 3. 配置服务设置
- **Name**: `resume-ai-backend`
- **Environment**: `Node`
- **Region**: `Oregon (US West)` 或 `Frankfurt (EU Central)`
- **Branch**: `main`
- **Root Directory**: `server/`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. 环境变量配置
在 Render 控制台添加以下环境变量：
```
MONGODB_URI=mongodb+srv://wangshiyang000_db_user:你的密码@cluster0.2uxwl07.mongodb.net/resumeai?retryWrites=true&w=majority
NODE_ENV=production
PORT=10000
```

### 5. 开始部署
- 点击 "Create Web Service"
- Render 会自动开始构建和部署
- 等待部署完成（约 5-10 分钟）

### 6. 获取后端 URL
部署完成后，Render 会提供一个类似这样的 URL：
`https://resume-ai-backend.onrender.com`

### 7. 更新前端 API 地址
将前端代码中的 API 地址改为 Render 的 URL：
```javascript
const API_BASE = 'https://resume-ai-backend.onrender.com';
```

## 优势对比
- **Render.com**: 对 Node.js 应用友好，部署简单
- **Railway**: 持续 502 错误，Docker 环境问题

## 预计时间
- 注册和配置：5 分钟
- 首次部署：10 分钟
- 测试验证：5 分钟

**总计：约 20 分钟即可完成部署**

立即开始吧！