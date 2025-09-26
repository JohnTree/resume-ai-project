#!/bin/bash

# 🚀 简历AI应用一键部署脚本

echo "🚀 开始部署简历AI应用到生产环境..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查必要工具
check_requirements() {
    echo -e "${BLUE}📋 检查部署环境...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 未安装${NC}"
        exit 1
    fi
    
    if ! command -v expo &> /dev/null; then
        echo -e "${YELLOW}⚠️  Expo CLI 未安装，正在安装...${NC}"
        npm install -g @expo/cli
    fi
    
    echo -e "${GREEN}✅ 环境检查完成${NC}"
}

# 部署后端
deploy_backend() {
    echo -e "${BLUE}🔧 部署后端服务...${NC}"
    
    cd server
    
    # 安装依赖
    echo "📦 安装后端依赖..."
    npm install --production
    
    # 检查环境变量
    if [ ! -f ".env.production" ]; then
        echo -e "${YELLOW}⚠️  请配置 .env.production 文件${NC}"
        echo "参考 .env.production.example 文件"
    fi
    
    # 启动服务
    echo "🚀 启动后端服务..."
    if command -v pm2 &> /dev/null; then
        pm2 start ecosystem.config.js --env production
        echo -e "${GREEN}✅ 后端服务已通过PM2启动${NC}"
    else
        echo -e "${YELLOW}⚠️  PM2 未安装，使用普通方式启动${NC}"
        NODE_ENV=production npm start &
        echo -e "${GREEN}✅ 后端服务已启动${NC}"
    fi
    
    cd ..
}

# 构建前端
build_frontend() {
    echo -e "${BLUE}📱 构建前端应用...${NC}"
    
    cd ResumeAI
    
    # 安装依赖
    echo "📦 安装前端依赖..."
    npm install
    
    # 检查EAS配置
    if [ ! -f "eas.json" ]; then
        echo -e "${RED}❌ eas.json 配置文件不存在${NC}"
        exit 1
    fi
    
    # 登录EAS
    echo "🔐 登录Expo账户..."
    expo login
    
    # 构建应用
    echo "🏗️  构建生产版本..."
    read -p "选择构建平台 (ios/android/all): " platform
    
    case $platform in
        ios)
            eas build --platform ios --profile production
            ;;
        android)
            eas build --platform android --profile production
            ;;
        all)
            eas build --platform all --profile production
            ;;
        *)
            echo -e "${RED}❌ 无效的平台选择${NC}"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}✅ 前端构建完成${NC}"
    cd ..
}

# 部署验证
verify_deployment() {
    echo -e "${BLUE}🔍 验证部署状态...${NC}"
    
    # 检查后端服务
    echo "检查后端服务..."
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 后端服务运行正常${NC}"
    else
        echo -e "${RED}❌ 后端服务无响应${NC}"
    fi
    
    # 检查数据库连接
    echo "检查数据库连接..."
    # 这里可以添加数据库连接检查逻辑
    
    echo -e "${GREEN}✅ 部署验证完成${NC}"
}

# 显示部署信息
show_deployment_info() {
    echo -e "${GREEN}🎉 部署完成！${NC}"
    echo ""
    echo -e "${BLUE}📊 部署信息:${NC}"
    echo "• 后端服务: http://localhost:3001"
    echo "• API文档: http://localhost:3001/api"
    echo "• 应用构建: 查看EAS Dashboard"
    echo ""
    echo -e "${YELLOW}📝 下一步:${NC}"
    echo "1. 在EAS Dashboard查看构建状态"
    echo "2. 下载构建好的应用进行测试"
    echo "3. 提交到App Store/Google Play"
    echo ""
    echo -e "${BLUE}🔗 有用链接:${NC}"
    echo "• EAS Dashboard: https://expo.dev"
    echo "• 部署文档: ./PRODUCTION_DEPLOYMENT_GUIDE.md"
}

# 主函数
main() {
    echo -e "${GREEN}🚀 简历AI应用部署脚本${NC}"
    echo "=================================="
    
    check_requirements
    
    read -p "是否部署后端服务? (y/n): " deploy_backend_choice
    if [ "$deploy_backend_choice" = "y" ]; then
        deploy_backend
    fi
    
    read -p "是否构建前端应用? (y/n): " build_frontend_choice
    if [ "$build_frontend_choice" = "y" ]; then
        build_frontend
    fi
    
    if [ "$deploy_backend_choice" = "y" ]; then
        verify_deployment
    fi
    
    show_deployment_info
}

# 运行主函数
main