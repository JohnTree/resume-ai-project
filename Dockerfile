FROM node:18-alpine

WORKDIR /app

# 复制package.json文件
COPY server/package*.json ./server/

# 安装依赖
RUN cd server && npm install

# 复制应用代码
COPY . .

# 设置工作目录
WORKDIR /app/server

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["npm", "start"]