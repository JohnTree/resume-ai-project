# 🚀 腾讯云部署指南

## 📋 部署清单

### ✅ 第一阶段：购买服务（现在就做）
- [ ] 购买腾讯云域名
- [ ] 购买腾讯云服务器（CVM）
- [ ] 配置域名解析
- [ ] 申请SSL证书

### ✅ 第二阶段：服务器配置
- [ ] 连接服务器
- [ ] 安装Node.js和MongoDB
- [ ] 配置防火墙
- [ ] 部署后端代码

### ✅ 第三阶段：应用发布
- [ ] 构建前端应用
- [ ] 发布到App Store/Google Play

## 🛒 第一步：购买腾讯云服务

### 1. 购买域名
1. 访问：https://cloud.tencent.com/product/domain
2. 搜索域名（建议：`resumemaster`、`resumeai`、`简历大师`相关）
3. 选择 `.com` 或 `.cn` 域名
4. 完成购买和实名认证

### 2. 购买云服务器
**推荐配置**：
```
产品：轻量应用服务器 或 云服务器CVM
CPU：2核
内存：4GB  
硬盘：40GB SSD
带宽：5Mbps
地域：选择离你用户最近的（如：北京、上海、广州）
系统：Ubuntu 20.04 LTS
```

**购买链接**：https://cloud.tencent.com/product/cvm

### 3. 配置域名解析
在腾讯云DNS解析中添加：
```
类型    主机记录    记录值
A       api        你的服务器IP
A       www        你的服务器IP  
A       @          你的服务器IP
```

## 🔧 第二步：服务器环境配置

### 连接服务器
```bash
# 使用腾讯云提供的SSH密钥或密码连接
ssh ubuntu@你的服务器IP
```

### 安装必要软件
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# 启动MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# 安装PM2
sudo npm install -g pm2

# 安装Nginx
sudo apt install -y nginx

# 安装Git
sudo apt install -y git
```

### 配置防火墙
```bash
# 开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3001  # API服务
sudo ufw enable
```

## 📦 第三步：部署应用代码

### 上传代码到服务器
```bash
# 在服务器上克隆代码（如果你有Git仓库）
git clone https://github.com/你的用户名/你的仓库.git
cd 你的仓库

# 或者使用scp上传本地代码
# 在本地执行：
scp -r ./server ubuntu@你的服务器IP:/home/ubuntu/resumeai-server
```

### 配置生产环境
```bash
cd /home/ubuntu/resumeai-server
cp .env.production .env

# 编辑环境变量
nano .env
```

修改 `.env` 文件：
```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/resumeai
JWT_SECRET=你的超级安全密钥
DASHSCOPE_API_KEY=sk-你的阿里云API密钥
AI_PROVIDER=dashscope
ALLOWED_ORIGINS=https://你的域名.com,https://api.你的域名.com
```

### 启动服务
```bash
# 安装依赖
npm install --production

# 使用PM2启动
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🌐 第四步：配置Nginx反向代理

创建Nginx配置：
```bash
sudo nano /etc/nginx/sites-available/resumeai
```

添加配置：
```nginx
server {
    listen 80;
    server_name api.你的域名.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/resumeai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 第五步：配置SSL证书

### 使用腾讯云SSL证书
1. 在腾讯云控制台申请免费SSL证书
2. 下载Nginx格式证书
3. 上传到服务器 `/etc/nginx/ssl/` 目录

### 更新Nginx配置支持HTTPS
```nginx
server {
    listen 443 ssl;
    server_name api.你的域名.com;
    
    ssl_certificate /etc/nginx/ssl/你的域名.crt;
    ssl_certificate_key /etc/nginx/ssl/你的域名.key;
    
    location / {
        proxy_pass http://localhost:3001;
        # ... 其他配置
    }
}

server {
    listen 80;
    server_name api.你的域名.com;
    return 301 https://$server_name$request_uri;
}
```

## 📱 第六步：更新前端配置

修改 `ResumeAI/src/constants/Config.ts`：
```typescript
export const API_CONFIG = {
  DEV: {
    BASE_URL: 'http://localhost:3001/api',
    TIMEOUT: 10000,
  },
  PROD: {
    BASE_URL: 'https://api.你的域名.com/api', // 🔥 使用你的腾讯云域名
    TIMEOUT: 15000,
  },
};
```

## 🚀 第七步：构建和发布应用

```bash
cd ResumeAI
npm install
expo login
eas build --platform all --profile production
```

## 💰 成本估算

### 腾讯云费用（月）
- **域名**: ¥55/年 (.com域名)
- **轻量服务器**: ¥24-50/月 (2核4G)
- **SSL证书**: 免费
- **总计**: 约 ¥30-60/月

## 🎯 现在立即行动

### 今天就做：
1. **购买域名** - 10分钟
2. **购买服务器** - 5分钟  
3. **配置域名解析** - 5分钟

### 明天做：
1. **配置服务器环境** - 30分钟
2. **部署后端代码** - 20分钟
3. **测试API服务** - 10分钟

### 后天做：
1. **构建前端应用** - 30分钟
2. **提交到应用商店** - 60分钟

---

**🎊 3天内你的应用就能上线了！现在就去腾讯云买域名和服务器吧！**