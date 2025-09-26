# 后端API服务部署指南

## 问题分析
前端已成功部署到Vercel，但出现"接口不存在"错误，因为后端API服务尚未部署。

## 推荐部署方案：Railway（免费）

### 为什么选择Railway？
- **免费额度**：每月$5免费额度，足够个人项目使用
- **简单易用**：GitHub集成，自动部署
- **支持Node.js**：完美支持Express后端
- **环境变量管理**：方便配置MongoDB连接

## 第一步：准备后端代码

### 后端项目结构
```
server/
├── index.js          # 主服务器文件
├── package.json      # 依赖配置
├── .env.production   # 生产环境配置
├── middleware/       # 中间件
├── models/           # 数据模型
├── routes/           # 路由
└── services/         # 服务层
```

## 第二步：创建Railway账户

1. 访问 [https://railway.app](https://railway.app)
2. 点击 "Start a New Project"
3. 选择使用GitHub登录
4. 授权Railway访问你的GitHub仓库

## 第三步：部署后端服务

### 方法一：通过GitHub部署（推荐）

1. 在Railway控制台点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 找到你的仓库 `JohnTree/ResumeAI`
4. 选择要部署的分支（通常是 `main`）
5. Railway会自动检测到Node.js项目并开始部署

### 方法二：通过Railway CLI部署

```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up
```

## 第四步：配置环境变量（详细界面操作）

### 环境变量添加位置和步骤：

1. **登录Railway控制台**：访问 [https://railway.app](https://railway.app) 并登录

2. **进入项目页面**：
   - 点击左侧菜单的 "Projects"
   - 找到并点击你的项目 "resumeai-backend"

3. **找到环境变量设置**：
   - 在项目详情页，点击顶部菜单的 **"Variables"** 标签
   - 或者点击左侧菜单的 **"Environment"** → **"Variables"**

4. **添加环境变量的具体操作**：
   - 点击 **"New Variable"** 按钮
   - 在 "Name" 输入框中输入变量名（如：`NODE_ENV`）
   - 在 "Value" 输入框中输入变量值（如：`production`）
   - 点击 **"Add"** 按钮保存

5. **需要添加的环境变量**：
   ```
   Name: NODE_ENV
   Value: production
   
   Name: MONGODB_URI  
   Value: mongodb+srv://wangshiyang000_db_user:<password>@cluster0.2uxwl07.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   
   Name: PORT
   Value: 3000
   ```

**注意**：将 `<password>` 替换为你的MongoDB Atlas实际密码

### 界面截图说明：
- **Variables页面**：显示所有环境变量的列表
- **添加按钮**：通常在页面右上角或变量列表上方
- **变量格式**：每行一个变量，格式为 `NAME=VALUE`
- **保存方式**：添加后自动保存，无需额外确认

### 验证环境变量：
添加完成后，Railway会自动重新部署项目。你可以在部署日志中看到环境变量已生效。

## 第五步：配置构建设置

Railway会自动检测Node.js项目，但可以手动配置：

### 构建命令（如果需要）
```json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm install"
  }
}
```

### 启动命令
确保 `package.json` 中有正确的启动脚本：
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

## 第六步：获取后端API地址

部署成功后，Railway会提供一个类似这样的URL：
- `https://resumeai-backend-production.up.railway.app`

这个URL就是你的后端API地址。

## 第七步：配置Vercel代理（重要）

由于前端部署在Vercel，后端在Railway，需要配置代理来解决跨域问题。

### 方法一：修改Vercel配置

在项目根目录创建 `vercel.json`（如果不存在）：

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
      "src": "/api/(.*)",
      "dest": "https://resumeai-backend-production.up.railway.app/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

### 方法二：使用重写规则

或者在Vercel项目设置的 "Rewrites" 中添加：

```json
{
  "source": "/api/:path*",
  "destination": "https://resumeai-backend-production.up.railway.app/api/:path*"
}
```

## 第八步：测试API连接

部署完成后，测试API是否正常工作：

### 测试健康检查
```bash
curl https://resumeai-backend-production.up.railway.app/api/health
```

### 测试用户注册
```bash
curl -X POST https://resumeai-backend-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

## 替代部署方案

### 方案二：Heroku（免费额度有限）

1. 访问 [https://heroku.com](https://heroku.com)
2. 创建新应用
3. 连接GitHub仓库
4. 配置环境变量
5. 部署

### 方案三：Render（免费）

1. 访问 [https://render.com](https://render.com)
2. 创建Web Service
3. 连接GitHub仓库
4. 配置构建和启动命令

## 部署检查清单

### ✅ 后端检查
- [ ] Railway项目创建成功
- [ ] 环境变量配置正确
- [ ] 代码部署成功
- [ ] API地址可访问
- [ ] 数据库连接正常

### ✅ 前端检查
- [ ] Vercel代理配置正确
- [ ] API请求指向正确路径
- [ ] 跨域问题已解决
- [ ] 所有功能测试通过

## 故障排除

### 问题1：CORS错误
**解决方案**：确保后端CORS配置允许Vercel域名

### 问题2：数据库连接失败
**解决方案**：
1. 检查MongoDB Atlas IP白名单
2. 验证连接字符串格式
3. 确认数据库用户权限

### 问题3：API返回404
**解决方案**：
1. 检查Railway部署日志
2. 验证路由配置
3. 测试API端点直接访问

## 监控和维护

### Railway监控
- 查看部署日志
- 监控资源使用情况
- 设置自动缩放

### 数据库监控
- MongoDB Atlas提供免费监控
- 设置警报阈值
- 定期备份数据

## 成本控制

### 免费资源限制
- **Railway**：每月$5免费额度
- **MongoDB Atlas**：512MB免费存储
- **Vercel**：无限免费静态网站

### 优化建议
1. 启用缓存减少API调用
2. 使用CDN加速静态资源
3. 优化数据库查询性能

## 下一步操作

1. **部署后端**：按照上述步骤部署到Railway
2. **配置代理**：更新Vercel路由配置
3. **测试功能**：全面测试前后端连接
4. **监控性能**：设置监控和警报

部署完成后，你的简历AI项目将完全可用，其他人可以通过Vercel提供的域名访问你的应用！