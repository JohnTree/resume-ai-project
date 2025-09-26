# 真实支付环境接入指导

## 📋 准备工作清单

### 1. Apple Developer账号准备
- [ ] 注册Apple Developer账号 ($99/年)
- [ ] 创建App ID
- [ ] 配置In-App Purchase能力
- [ ] 创建订阅产品

### 2. Google Play Console准备 (Android)
- [ ] 注册Google Play Console账号 ($25一次性)
- [ ] 创建应用
- [ ] 配置Google Play Billing
- [ ] 创建订阅产品

## 🍎 iOS真实支付接入步骤

### Step 1: 安装依赖
```bash
cd ResumeAI
npm install react-native-iap
```

### Step 2: App Store Connect配置

#### 2.1 创建订阅群组
1. 登录 [App Store Connect](https://appstoreconnect.apple.com)
2. 选择你的应用
3. 功能 → App内购买项目
4. 点击"+"创建订阅群组
5. 群组名称：`ResumeAI Pro Subscriptions`

#### 2.2 创建订阅产品
创建以下三个订阅产品：

**月度订阅：**
- 产品ID: `monthly_pro_subscription`
- 价格: ¥19.00 (中国区)
- 订阅时长: 1个月
- 免费试用: 7天

**年度订阅：**
- 产品ID: `yearly_pro_subscription`  
- 价格: ¥99.00 (中国区)
- 订阅时长: 1年
- 免费试用: 7天

**终身购买：**
- 产品ID: `lifetime_pro_purchase`
- 类型: 非消耗型项目
- 价格: ¥299.00 (中国区)

### Step 3: 代码实现

#### 3.1 更新PaymentService.ts
```typescript
import { Platform, Alert } from 'react-native';
import RNIap, {
  Product,
  ProductPurchase,
  SubscriptionPurchase,
  PurchaseError,
  requestPurchase,
  requestSubscription,
  finishTransaction,
  getProducts,
  getSubscriptions,
  initConnection,
  endConnection,
  validateReceiptIos,
  validateReceiptAndroid,
} from 'react-native-iap';

// 产品ID配置
const PRODUCT_IDS = {
  ios: {
    monthly: 'monthly_pro_subscription',
    yearly: 'yearly_pro_subscription', 
    lifetime: 'lifetime_pro_purchase'
  },
  android: {
    monthly: 'monthly_pro_subscription',
    yearly: 'yearly_pro_subscription',
    lifetime: 'lifetime_pro_purchase'
  }
};

class RealPaymentService {
  private products: Product[] = [];
  private subscriptions: Product[] = [];

  async initialize(): Promise<boolean> {
    try {
      await initConnection();
      await this.loadProducts();
      return true;
    } catch (error) {
      console.error('Payment initialization failed:', error);
      return false;
    }
  }

  private async loadProducts(): Promise<void> {
    try {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      const productIds = Object.values(PRODUCT_IDS[platform]);
      
      if (Platform.OS === 'ios') {
        // iOS: 分别获取订阅和一次性购买
        const subscriptionIds = [PRODUCT_IDS.ios.monthly, PRODUCT_IDS.ios.yearly];
        const productIds = [PRODUCT_IDS.ios.lifetime];
        
        this.subscriptions = await getSubscriptions(subscriptionIds);
        this.products = await getProducts(productIds);
      } else {
        // Android: 使用Google Play Billing
        this.products = await getProducts(productIds);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  async purchaseProduct(productId: string): Promise<PaymentResult> {
    try {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      const realProductId = PRODUCT_IDS[platform][productId as keyof typeof PRODUCT_IDS.ios];
      
      let purchase: ProductPurchase | SubscriptionPurchase;
      
      if (productId === 'lifetime') {
        // 一次性购买
        purchase = await requestPurchase(realProductId);
      } else {
        // 订阅购买
        purchase = await requestSubscription(realProductId);
      }
      
      // 验证收据
      const isValid = await this.verifyPurchase(purchase);
      
      if (isValid) {
        // 完成交易
        await finishTransaction(purchase);
        
        return {
          success: true,
          transactionId: purchase.transactionId,
          productId: realProductId,
          receipt: purchase.transactionReceipt
        };
      } else {
        throw new Error('Receipt validation failed');
      }
      
    } catch (error) {
      console.error('Purchase failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed'
      };
    }
  }

  private async verifyPurchase(purchase: ProductPurchase | SubscriptionPurchase): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        // iOS收据验证
        const receiptBody = {
          'receipt-data': purchase.transactionReceipt,
          'password': 'YOUR_SHARED_SECRET', // 从App Store Connect获取
        };
        
        // 先尝试生产环境
        let result = await validateReceiptIos(receiptBody, false);
        
        // 如果生产环境失败，尝试沙盒环境
        if (result.status === 21007) {
          result = await validateReceiptIos(receiptBody, true);
        }
        
        return result.status === 0;
      } else {
        // Android收据验证
        const result = await validateReceiptAndroid(
          purchase.productId,
          purchase.purchaseToken,
          'YOUR_GOOGLE_PLAY_SERVICE_ACCOUNT_KEY'
        );
        
        return result.isSuccessful;
      }
    } catch (error) {
      console.error('Receipt verification failed:', error);
      return false;
    }
  }

  async restorePurchases(): Promise<PaymentResult> {
    try {
      // 恢复购买逻辑
      const purchases = await RNIap.getAvailablePurchases();
      
      if (purchases.length > 0) {
        // 验证并恢复购买
        for (const purchase of purchases) {
          const isValid = await this.verifyPurchase(purchase);
          if (isValid) {
            // 恢复用户Pro状态
            return {
              success: true,
              transactionId: purchase.transactionId
            };
          }
        }
      }
      
      return {
        success: false,
        error: 'No valid purchases found'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Restore failed'
      };
    }
  }

  async cleanup(): Promise<void> {
    try {
      await endConnection();
    } catch (error) {
      console.error('Payment cleanup failed:', error);
    }
  }
}

export default new RealPaymentService();
```

### Step 4: 测试环境配置

#### 4.1 创建沙盒测试账号
1. App Store Connect → 用户和访问 → 沙盒测试员
2. 创建测试账号（使用未注册过Apple ID的邮箱）
3. 在iOS设备上登录沙盒账号

#### 4.2 测试流程
1. 在真机上安装应用（必须是真机，模拟器不支持支付）
2. 使用沙盒账号测试购买
3. 验证收据验证流程
4. 测试恢复购买功能

## 🤖 Android支付接入

### Step 1: Google Play Console配置
1. 创建订阅产品
2. 配置价格
3. 设置试用期

### Step 2: 代码实现
```typescript
// Android特定的支付逻辑
// 使用Google Play Billing Library
```

## 🔐 后端收据验证

### 创建验证服务
```javascript
// server/services/receiptVerification.js
const axios = require('axios');

class ReceiptVerificationService {
  async verifyAppleReceipt(receiptData, isProduction = true) {
    const url = isProduction 
      ? 'https://buy.itunes.apple.com/verifyReceipt'
      : 'https://sandbox.itunes.apple.com/verifyReceipt';
    
    try {
      const response = await axios.post(url, {
        'receipt-data': receiptData,
        'password': process.env.APPLE_SHARED_SECRET
      });
      
      return response.data;
    } catch (error) {
      throw new Error('Apple receipt verification failed');
    }
  }
  
  async verifyGoogleReceipt(productId, purchaseToken) {
    // Google Play收据验证逻辑
  }
}

module.exports = new ReceiptVerificationService();
```

## 📱 微信支付宝接入 (仅Android)

### 注意事项
- iOS应用商店不允许第三方支付
- Android可以在应用外使用微信支付宝
- 需要单独的支付页面（WebView）

### 实现方案
```typescript
// 仅Android平台
if (Platform.OS === 'android') {
  // 跳转到WebView支付页面
  // 使用微信支付宝SDK
}
```

## 🚀 上线前检查清单

### iOS
- [ ] 所有订阅产品已创建并审核通过
- [ ] 沙盒环境测试完成
- [ ] 收据验证服务部署
- [ ] 恢复购买功能测试
- [ ] 订阅管理页面完成

### Android  
- [ ] Google Play Console配置完成
- [ ] 签名APK上传
- [ ] 内测版本发布
- [ ] 支付功能测试

## 💡 重要提醒

1. **Apple审核要求**
   - 必须提供恢复购买功能
   - 订阅必须可以取消
   - 价格必须清晰显示

2. **收据验证**
   - 必须在服务器端验证
   - 防止越狱设备绕过支付

3. **用户体验**
   - 支付失败要有明确提示
   - 网络异常处理
   - 支付状态同步

## 📞 需要帮助？

如果在接入过程中遇到问题，可以：
1. 查看Apple/Google官方文档
2. 检查控制台错误日志
3. 使用沙盒环境调试
4. 联系技术支持

---

**下一步：开始实施Step 1，安装react-native-iap依赖包！**