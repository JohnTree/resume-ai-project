# 部署检查清单 ✅

## 第一步：MongoDB Atlas 配置
- [ ] 登录 MongoDB Atlas 控制台
- [ ] 为 `wangshiyang000_db_user` 用户设置密码
- [ ] 添加IP白名单：`0.0.0.0/0`（允许所有IP连接）
- [ ] 测试连接是否正常

## 第二步：GitHub 仓库准备
- [ ] 创建新的GitHub仓库（如：resumeai-backend）
- [ ] 将代码推送到GitHub
```bash
git init
git add .
git commit -m "feat: 简历大师AI后端"
git remote add origin https://github.com/你的用户名/resumeai-backend.git
git push -u origin main
```

## 第三步：Vercel 部署
- [ ] 访问 vercel.com 并登录
- [ ] 导入GitHub仓库
- [ ] 配置环境变量（使用 .env.production 中的值）
- [ ] 点击部署

## 第四步：前端部署
- [ ] 修改 demo.html 中的API地址为Vercel域名
- [ ] 将前端文件部署到另一个Vercel项目或Netlify

## 环境变量配置（Vercel）
```
MONGODB_URI=mongodb+srv://wangshiyang000_db_user:密码@cluster0.2uxwl07.mongodb.net/resumeai
JWT_SECRET=随机32位字符串
DASHSCOPE_API_KEY=sk-9d0511bb3ba5477083aeaa924bb1399d
NODE_ENV=production
```

## 测试部署
- [ ] 访问健康检查接口：https://你的域名.vercel.app/health
- [ ] 测试用户注册功能
- [ ] 测试AI优化功能