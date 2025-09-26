# AI服务集成说明

## 概述
已成功将前端的模拟AI服务替换为真实的阿里云通义千问API服务。

## 文件结构
```
src/
├── services/
│   ├── ApiService.ts      # API调用服务
│   ├── AIService.ts       # AI业务逻辑服务
│   └── README.md          # 本文件
├── hooks/
│   └── useAI.ts          # AI功能Hook
├── utils/
│   └── storage.ts        # 简化存储工具
└── constants/
    └── Config.ts         # 配置常量
```

## 主要变更

### 1. 创建了真实的API服务
- `ApiService.ts`: 负责与后端API通信
- 支持AI内容优化、简历评分、优化历史等功能
- 包含错误处理和备用方案

### 2. 业务逻辑封装
- `AIService.ts`: 封装AI相关业务逻辑
- 内容验证、快速建议等功能
- `useAI.ts`: React Hook，方便在组件中使用

### 3. 更新了ResumeEditorScreen
- 移除了模拟的AI优化代码
- 使用真实的API调用
- 改进了错误处理和用户体验

## 配置说明

### API地址配置
在 `src/constants/Config.ts` 中配置API地址：
```typescript
export const API_CONFIG = {
  DEV: {
    BASE_URL: 'http://localhost:3001/api',  // 开发环境
  },
  PROD: {
    BASE_URL: 'https://your-domain.com/api', // 生产环境
  },
};
```

### 后端服务
确保后端服务正在运行：
```bash
cd server
npm start
```

## 使用方法

### 在组件中使用AI功能
```typescript
import { useAI } from '../hooks/useAI';

function MyComponent() {
  const { isOptimizing, optimizeContent } = useAI();
  
  const handleOptimize = async () => {
    const result = await optimizeContent('我的工作经验', 'experience');
    if (result) {
      console.log('优化结果:', result.optimizedContent);
    }
  };
  
  return (
    <TouchableOpacity 
      onPress={handleOptimize}
      disabled={isOptimizing}
    >
      <Text>{isOptimizing ? '优化中...' : '优化内容'}</Text>
    </TouchableOpacity>
  );
}
```

## API接口

### 1. 内容优化
```
POST /api/ai/optimize
{
  "content": "要优化的内容",
  "type": "experience" | "skills" | "summary" | "education"
}
```

### 2. 简历评分
```
POST /api/ai/score
{
  "resumeData": { /* 简历数据 */ }
}
```

### 3. 优化历史
```
GET /api/ai/history
```

## 错误处理
- API调用失败时会自动降级到模拟数据
- 网络错误会显示友好的提示信息
- 包含内容验证和格式检查

## 注意事项
1. 确保后端服务正常运行
2. 检查API地址配置是否正确
3. 确保有有效的认证令牌（如果需要）
4. 网络连接正常

## 测试
可以通过以下方式测试AI功能：
1. 在简历编辑器中输入内容
2. 点击"AI优化"按钮
3. 查看控制台日志确认API调用
4. 验证优化结果是否正确显示