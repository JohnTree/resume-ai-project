#!/bin/bash

# 🚀 腾讯云服务器一键配置脚本

echo "🚀 开始配置腾讯云服务器环境..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 更新系统
echo -e "${BLUE}📦 更新系统包...${NC}"
sudo apt update && sudo apt upgrade -y

# 安装Node.js 18
echo -e "${BLUE}📦 安装Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证Node.js安装
node_version=$(node --version)
npm_version=$(npm --version)
echo -e "${GREEN}✅ Node.js ${node_version} 安装成功${NC}"
echo -e "${GREEN}✅ npm ${npm_version} 安装成功${NC}"

# 安装MongoDB
echo -e "${BLUE}📦 安装MongoDB...${NC}"
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# 启动MongoDB
echo -e "${BLUE}🚀 启动MongoDB服务...${NC}"
sudo systemctl start mongod
sudo systemctl enable mongod
echo -e "${GREEN}✅ MongoDB 服务已启动并设置为开机自启${NC}"

# 安装PM2
echo -e "${BLUE}📦 安装PM2...${NC}"
sudo npm install -g pm2
echo -e "${GREEN}✅ PM2 安装成功${NC}"

# 安装Nginx
echo -e "${BLUE}📦 安装Nginx...${NC}"
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
echo -e "${GREEN}✅ Nginx 安装成功并已启动${NC}"

# 安装其他必要工具
echo -e "${BLUE}📦 安装其他工具...${NC}"
sudo apt install -y git curl wget unzip

# 配置防火墙
echo -e "${BLUE}🔒 配置防火墙...${NC}"
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3001  # API服务
sudo ufw --force enable
echo -e "${GREEN}✅ 防火墙配置完成${NC}"

# 创建应用目录
echo -e "${BLUE}📁 创建应用目录...${NC}"
mkdir -p /home/ubuntu/resumeai
mkdir -p /home/ubuntu/resumeai/logs
sudo chown -R ubuntu:ubuntu /home/ubuntu/resumeai
echo -e "${GREEN}✅ 应用目录创建完成${NC}"

# 创建Nginx配置模板
echo -e "${BLUE}📝 创建Nginx配置模板...${NC}"
sudo tee /etc/nginx/sites-available/resumeai-template > /dev/null <<EOF
server {
    listen 80;
    server_name api.your-domain.com;  # 🔥 请修改为你的域名

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

echo -e "${GREEN}✅ Nginx配置模板已创建${NC}"

# 显示安装结果
echo ""
echo -e "${GREEN}🎉 服务器环境配置完成！${NC}"
echo ""
echo -e "${BLUE}📊 安装的软件版本:${NC}"
echo "• Node.js: $(node --version)"
echo "• npm: $(npm --version)"
echo "• MongoDB: $(mongod --version | head -n1)"
echo "• PM2: $(pm2 --version)"
echo "• Nginx: $(nginx -v 2>&1)"
echo ""
echo -e "${YELLOW}📝 下一步操作:${NC}"
echo "1. 上传你的应用代码到 /home/ubuntu/resumeai/"
echo "2. 配置环境变量文件 .env"
echo "3. 修改Nginx配置中的域名"
echo "4. 启动应用服务"
echo ""
echo -e "${BLUE}🔗 有用的命令:${NC}"
echo "• 查看MongoDB状态: sudo systemctl status mongod"
echo "• 查看Nginx状态: sudo systemctl status nginx"
echo "• 查看PM2进程: pm2 list"
echo "• 查看应用日志: pm2 logs"
echo ""
echo -e "${GREEN}✅ 服务器已准备就绪！${NC}"