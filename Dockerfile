FROM node:18-alpine

WORKDIR /app

# 复制server目录的package.json文件
COPY server/package*.json ./

# 安装依赖
RUN npm install

# 复制server目录的应用代码
COPY server/ ./

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["npm", "start"]