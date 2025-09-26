# 简历大师AI - 免费部署指南

## 🚀 部署方案：Vercel + MongoDB Atlas（完全免费）

### 第一步：准备MongoDB Atlas数据库
1. 访问 [MongoDB Atlas](https://www.mongodb.com/atlas)
2. 注册免费账号（512MB存储）
3. 创建集群，获取连接字符串
4. 设置数据库用户和IP白名单

### 第二步：部署后端到Vercel
1. 将代码推送到GitHub仓库
2. 访问 [Vercel](https://vercel.com) 并登录
3. 导入GitHub仓库
4. 配置环境变量：
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resumeai
   JWT_SECRET=your-super-secret-jwt-key
   DASHSCOPE_API_KEY=your-dashscope-api-key
   NODE_ENV=production
   ```
5. 点击部署

### 第三步：部署前端到Vercel/Netlify
1. 修改 `demo.html` 中的API地址为后端域名
2. 将前端文件推送到另一个GitHub仓库
3. 在Vercel/Netlify部署静态文件

### 环境变量说明
```env
MONGODB_URI=mongodb+srv://用户名:密码@集群地址/resumeai
JWT_SECRET=随机字符串（至少32位）
DASHSCOPE_API_KEY=阿里云通义千问API密钥
```

### 免费资源限制
- **Vercel**: 100GB带宽/月，无限请求
- **MongoDB Atlas**: 512MB存储，共享RAM
- **通义千问API**: 新用户有免费额度

### 自定义域名（可选）
1. 在域名服务商购买域名
2. 在Vercel配置自定义域名
3. 等待DNS生效

部署完成后，你的应用将可以通过类似 `https://your-app.vercel.app` 的地址访问！