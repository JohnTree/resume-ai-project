FROM node:18-alpine

# 安装Puppeteer所需的依赖
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# 告诉Puppeteer使用系统安装的Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

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