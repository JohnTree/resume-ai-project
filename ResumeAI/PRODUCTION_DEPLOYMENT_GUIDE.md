# 🚀 生产环境部署指南

## 📋 部署前检查清单

### ✅ 必须完成的配置
- [ ] 配置生产环境API地址
- [ ] 设置真实用户认证系统
- [ ] 配置生产环境变量
- [ ] 移除开发测试代码
- [ ] 优化应用性能
- [ ] 配置错误监控

## 🔧 1. 配置生产环境API地址

### 更新API配置
编辑 `src/constants/Config.ts`:

```typescript
export const API_CONFIG = {
  DEV: {
    BASE_URL: 'http://localhost:3001/api',
    TIMEOUT: 10000,
  },
  PROD: {
    BASE_URL: 'https://your-production-domain.com/api', // 🔥 修改为你的生产服务器地址
    TIMEOUT: 15000,
  },
};

// 根据环境选择配置
export const getCurrentConfig = () => {
  return __DEV__ ? API_CONFIG.DEV : API_CONFIG.PROD;
};
```

### 更新ApiService使用动态配置
编辑 `src/services/ApiService.ts`:

```typescript
import { getCurrentConfig } from '../constants/Config';

// API配置
const API_CONFIG = getCurrentConfig();
const API_BASE_URL = API_CONFIG.BASE_URL;
```

## 🔐 2. 配置真实用户认证

### 移除测试认证代码
编辑 `src/utils/testAuth.ts`:

```typescript
export const setupTestAuth = async () => {
  try {
    // 🚨 生产环境下不设置测试token
    if (__DEV__) {
      await SimpleStorage.setItem('authToken', 'admin-token-dev-2024');
      console.log('✅ 开发环境测试认证已设置');
    }
    // 生产环境下什么都不做，等待用户真实登录
  } catch (error) {
    console.error('设置测试认证失败:', error);
  }
};
```

### 更新ApiService认证逻辑
编辑 `src/services/ApiService.ts`:

```typescript
private async makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await this.getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // 🔥 生产环境必须有真实token
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // 生产环境下的错误处理
      if (response.status === 401) {
        // 重定向到登录页面
        throw new Error('请先登录');
      }
      throw new Error(data.error || data.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
}
```

## 🌐 3. 后端生产环境配置

### 服务器环境变量
创建 `server/.env.production`:

```bash
# 生产环境配置
NODE_ENV=production
PORT=3001

# 数据库配置
MONGODB_URI=mongodb://your-production-db-url/resumeai

# JWT密钥 - 使用强密钥
JWT_SECRET=your-super-secure-jwt-secret-key-for-production

# 阿里云API配置
DASHSCOPE_API_KEY=sk-your-production-dashscope-key
AI_PROVIDER=dashscope

# CORS配置
ALLOWED_ORIGINS=https://your-app-domain.com,https://your-web-domain.com
```

### 生产环境启动脚本
在 `server/package.json` 中添加:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "prod": "NODE_ENV=production node index.js"
  }
}
```

## 📱 4. 前端生产构建

### React Native生产构建

#### iOS构建
```bash
cd ResumeAI
# 构建iOS生产版本
expo build:ios --type archive
# 或使用EAS Build
eas build --platform ios --profile production
```

#### Android构建
```bash
cd ResumeAI
# 构建Android生产版本
expo build:android --type app-bundle
# 或使用EAS Build
eas build --platform android --profile production
```

### 配置EAS Build
创建 `ResumeAI/eas.json`:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "env": {
        "API_BASE_URL": "https://your-production-domain.com/api"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 🔒 5. 安全配置

### 移除调试代码
编辑 `src/services/ApiService.ts`:

```typescript
// 🚨 生产环境下移除详细日志
private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // ... 其他代码
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || '请求失败');
    }

    return data;
  } catch (error) {
    // 🔥 生产环境下不输出敏感信息
    if (__DEV__) {
      console.error('API请求错误:', error);
    }
    throw error;
  }
}
```

### 配置网络安全
在 `server/index.js` 中添加安全中间件:

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 安全头
app.use(helmet());

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 15分钟内最多100个请求
});
app.use('/api/', limiter);

// CORS配置
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

## 🚀 6. 部署步骤

### 后端部署（推荐使用云服务）

#### 使用阿里云ECS
```bash
# 1. 上传代码到服务器
scp -r server/ user@your-server:/path/to/app/

# 2. 安装依赖
cd /path/to/app/server
npm install --production

# 3. 启动服务
pm2 start index.js --name "resumeai-backend"
```

#### 使用Docker部署
创建 `server/Dockerfile`:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "run", "prod"]
```

### 前端部署

#### 发布到App Store
```bash
cd ResumeAI
# 构建并提交到App Store
eas build --platform ios --profile production
eas submit --platform ios
```

#### 发布到Google Play
```bash
cd ResumeAI
# 构建并提交到Google Play
eas build --platform android --profile production
eas submit --platform android
```

## 📊 7. 监控和日志

### 添加错误监控
安装Sentry:

```bash
cd ResumeAI
npm install @sentry/react-native
```

配置Sentry:

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
});
```

### 后端日志配置
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## ✅ 部署验证清单

### 部署后检查
- [ ] API服务正常响应
- [ ] 数据库连接成功
- [ ] AI服务调用正常
- [ ] 用户认证流程正常
- [ ] 应用在真机上正常运行
- [ ] 错误监控正常工作
- [ ] 性能指标正常

### 测试流程
1. 用户注册/登录
2. 创建简历
3. AI优化功能
4. 简历导出
5. 支付功能（如果有）

## 🎯 性能优化建议

### 前端优化
- 启用代码分割
- 图片压缩和懒加载
- API请求缓存
- 减少包体积

### 后端优化
- 数据库索引优化
- API响应缓存
- CDN配置
- 负载均衡

---

**🚀 准备好了！按照这个指南，你的简历AI应用就可以成功部署到生产环境了！**