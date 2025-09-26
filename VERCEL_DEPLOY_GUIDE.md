# Vercel 前端部署详细指南

## 项目概述
- **前端文件**: `demo.html` (演示页面) 和 `public/index.html` (简历编辑器)
- **后端API**: Node.js Express 服务器
- **数据库**: MongoDB Atlas
- **部署平台**: Vercel (前端) + MongoDB Atlas (数据库)

## 第一步：访问 Vercel 并登录

1. 打开浏览器访问 [https://vercel.com](https://vercel.com)
2. 点击右上角 "Sign Up" 或 "Log In"
3. 选择使用 GitHub 账户登录（推荐）

## 第二步：创建新项目

1. 登录后点击仪表板上的 **"Add New..."** → **"Project"**
2. 在 "Import Git Repository" 页面，你会看到你的 GitHub 仓库列表
3. 找到并选择你的仓库：**JohnTree/ResumeAI**（或你的仓库名）

## 第三步：配置项目设置

### 基础配置
- **Project Name**: `resume-ai`（自动生成，可修改）
- **Framework Preset**: 选择 **"Other"** 或 **"Static"**
- **Root Directory**: 保持默认（项目根目录）

### 环境变量配置
在 "Environment Variables" 部分添加以下变量：

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://wangshiyang000_db_user:<password>@cluster0.2uxwl07.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

**注意**: 将 `<password>` 替换为你的 MongoDB Atlas 实际密码

### 构建和输出设置
- **Build Command**: 留空（因为是静态文件）
- **Output Directory**: 留空（Vercel 会自动检测）

## 第四步：部署配置

### 路由配置（vercel.json 已配置）
项目根目录的 `vercel.json` 文件已包含正确的路由配置：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "demo.html",
      "use": "@vercel/static"
    },
    {
      "src": "public/index.html", 
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/",
      "dest": "/demo.html"
    },
    {
      "src": "/editor",
      "dest": "/public/index.html"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

## 第五步：开始部署

1. 点击 **"Deploy"** 按钮
2. Vercel 会自动：
   - 拉取你的 GitHub 代码
   - 安装依赖（如果有 package.json）
   - 构建项目
   - 部署到全球 CDN

## 第六步：访问部署的网站

部署完成后，你会获得一个类似这样的网址：
- `https://resume-ai.vercel.app`（主演示页面）
- `https://resume-ai.vercel.app/editor`（简历编辑器）

## 页面访问说明

### 1. 主演示页面 (`/`)
- 访问根路径自动重定向到 `demo.html`
- 功能：系统状态检查、用户注册测试、AI优化测试

### 2. 简历编辑器 (`/editor`)
- 访问 `/editor` 路径显示 `public/index.html`
- 功能：完整的简历编辑、模板选择、PDF生成

## 部署后检查清单

### ✅ 前端检查
- [ ] 主演示页面能正常访问
- [ ] 简历编辑器页面能正常加载
- [ ] CSS 样式正确显示
- [ ] JavaScript 功能正常

### ✅ 后端API检查
- [ ] 确保后端服务器已部署（需要单独部署）
- [ ] 检查 API 连接是否正常
- [ ] 测试用户注册功能
- [ ] 测试 AI 优化功能

## 常见问题解决

### 问题1：页面显示404错误
**解决方案**：检查 `vercel.json` 路由配置是否正确

### 问题2：API请求失败
**解决方案**：
1. 确保后端服务器已部署并运行
2. 检查前端代码中的 API 地址是否正确
3. 确认 CORS 配置允许 Vercel 域名

### 问题3：静态资源加载失败
**解决方案**：
1. 检查 `public` 目录下的文件路径
2. 确保 CSS 和 JS 文件引用正确
3. 验证 `vercel.json` 中的路由配置

## 自定义域名（可选）

如果需要使用自定义域名：
1. 在 Vercel 项目设置中选择 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

## 自动部署设置

Vercel 默认启用自动部署：
- 每次推送到 `main` 分支会自动重新部署
- 支持预览部署（用于 PR 测试）

## 环境变量管理

### 生产环境变量
在 Vercel 仪表板的 "Environment Variables" 中设置：
- `NODE_ENV=production`
- `MONGODB_URI=你的MongoDB连接字符串`

### 开发环境变量
如果需要开发环境变量，可以在 "Environment Variables" 中添加：
- 选择对应的环境（Production/Preview/Development）

## 监控和日志

部署后可以查看：
- **Deployments**: 查看部署历史和状态
- **Analytics**: 网站访问统计
- **Logs**: 运行时错误日志

## 下一步操作

1. **部署后端API**: 需要将 `server` 目录部署到其他平台（如 Railway、Heroku 等）
2. **测试完整功能**: 确保前后端能正常通信
3. **配置域名**: 如有需要，配置自定义域名
4. **设置监控**: 配置错误监控和性能监控

## 技术支持

如果部署过程中遇到问题：
1. 查看 Vercel 官方文档
2. 检查部署日志中的错误信息
3. 确保所有文件路径和配置正确

---

**部署成功标志**：当你能够通过 Vercel 提供的域名正常访问演示页面和编辑器页面，并且所有功能正常工作时，部署就成功了！