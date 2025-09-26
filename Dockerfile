FROM node:18-alpine

WORKDIR /app

# 复制package.json文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制应用代码
COPY . ./

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["npm", "start"]