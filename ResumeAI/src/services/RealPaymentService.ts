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
  getAvailablePurchases,
} from 'react-native-iap';

export interface PaymentProduct {
  id: string;
  name: string;
  price: string;
  period: string;
  type: 'subscription' | 'consumable';
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  productId?: string;
  receipt?: string;
  error?: string;
}

// 产品ID配置 - 这些需要在App Store Connect中创建
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
  private isInitialized = false;

  // 初始化支付服务
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      console.log('🔄 Initializing payment service...');
      await initConnection();
      await this.loadProducts();
      this.isInitialized = true;
      console.log('✅ Payment service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Payment initialization failed:', error);
      return false;
    }
  }

  // 加载产品信息
  private async loadProducts(): Promise<void> {
    try {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      
      if (Platform.OS === 'ios') {
        // iOS: 分别获取订阅和一次性购买
        const subscriptionIds = [PRODUCT_IDS.ios.monthly, PRODUCT_IDS.ios.yearly];
        const productIds = [PRODUCT_IDS.ios.lifetime];
        
        console.log('📱 Loading iOS products...', { subscriptionIds, productIds });
        
        try {
          this.subscriptions = await getSubscriptions(subscriptionIds);
          console.log('✅ Subscriptions loaded:', this.subscriptions.length);
        } catch (error) {
          console.warn('⚠️ Failed to load subscriptions:', error);
          this.subscriptions = [];
        }
        
        try {
          this.products = await getProducts(productIds);
          console.log('✅ Products loaded:', this.products.length);
        } catch (error) {
          console.warn('⚠️ Failed to load products:', error);
          this.products = [];
        }
      } else {
        // Android: 使用Google Play Billing
        const productIds = Object.values(PRODUCT_IDS.android);
        console.log('🤖 Loading Android products...', productIds);
        
        try {
          this.products = await getProducts(productIds);
          console.log('✅ Android products loaded:', this.products.length);
        } catch (error) {
          console.warn('⚠️ Failed to load Android products:', error);
          this.products = [];
        }
      }
    } catch (error) {
      console.error('❌ Failed to load products:', error);
    }
  }

  // 获取可用产品
  async getProducts(): Promise<PaymentProduct[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const allProducts = [...this.products, ...this.subscriptions];
    
    return allProducts.map(product => ({
      id: this.getLocalProductId(product.productId),
      name: product.title || product.productId,
      price: product.localizedPrice || product.price,
      period: this.getPeriodFromProductId(product.productId),
      type: this.subscriptions.some(s => s.productId === product.productId) ? 'subscription' : 'consumable'
    }));
  }

  // 购买产品
  async purchaseProduct(productId: string): Promise<PaymentResult> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          return {
            success: false,
            error: '支付服务初始化失败，请重试'
          };
        }
      }

      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      const realProductId = PRODUCT_IDS[platform][productId as keyof typeof PRODUCT_IDS.ios];
      
      if (!realProductId) {
        return {
          success: false,
          error: '产品不存在'
        };
      }

      console.log(`🛒 Attempting to purchase: ${productId} (${realProductId})`);
      
      let purchase: ProductPurchase | SubscriptionPurchase;
      
      if (productId === 'lifetime') {
        // 一次性购买
        purchase = await requestPurchase(realProductId);
      } else {
        // 订阅购买
        purchase = await requestSubscription(realProductId);
      }
      
      console.log('✅ Purchase successful:', purchase.transactionId);
      
      // 验证收据（在生产环境中应该在服务器端进行）
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
        console.warn('⚠️ Receipt validation failed');
        return {
          success: false,
          error: '购买验证失败，请联系客服'
        };
      }
      
    } catch (error: any) {
      console.error('❌ Purchase failed:', error);
      
      // 处理用户取消购买
      if (error.code === 'E_USER_CANCELLED') {
        return {
          success: false,
          error: '用户取消了购买'
        };
      }
      
      // 处理网络错误
      if (error.code === 'E_NETWORK_ERROR') {
        return {
          success: false,
          error: '网络连接失败，请检查网络后重试'
        };
      }
      
      // 处理产品不可用
      if (error.code === 'E_ITEM_UNAVAILABLE') {
        return {
          success: false,
          error: '该产品暂时不可用，请稍后重试'
        };
      }
      
      return {
        success: false,
        error: error.message || '购买失败，请重试'
      };
    }
  }

  // 恢复购买
  async restorePurchases(): Promise<PaymentResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('🔄 Restoring purchases...');
      const purchases = await getAvailablePurchases();
      
      console.log(`📦 Found ${purchases.length} previous purchases`);
      
      if (purchases.length > 0) {
        // 验证并恢复购买
        for (const purchase of purchases) {
          const isValid = await this.verifyPurchase(purchase);
          if (isValid) {
            console.log('✅ Valid purchase restored:', purchase.productId);
            return {
              success: true,
              transactionId: purchase.transactionId,
              productId: purchase.productId
            };
          }
        }
      }
      
      return {
        success: false,
        error: '没有找到有效的购买记录'
      };
    } catch (error: any) {
      console.error('❌ Restore purchases failed:', error);
      return {
        success: false,
        error: error.message || '恢复购买失败'
      };
    }
  }

  // 检查订阅状态
  async checkSubscriptionStatus(): Promise<{
    isActive: boolean;
    expiryDate?: Date;
    productId?: string;
  }> {
    try {
      const purchases = await getAvailablePurchases();
      
      for (const purchase of purchases) {
        const isValid = await this.verifyPurchase(purchase);
        if (isValid) {
          // 检查是否是订阅产品
          const isSubscription = this.subscriptions.some(s => s.productId === purchase.productId);
          
          if (isSubscription) {
            // 对于订阅，需要检查过期时间
            // 这里简化处理，实际应该解析收据获取准确的过期时间
            return {
              isActive: true,
              productId: purchase.productId,
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 假设30天后过期
            };
          } else {
            // 一次性购买（终身）
            return {
              isActive: true,
              productId: purchase.productId
            };
          }
        }
      }
      
      return { isActive: false };
    } catch (error) {
      console.error('❌ Failed to check subscription status:', error);
      return { isActive: false };
    }
  }

  // 验证购买（简化版本，生产环境应该在服务器端进行）
  private async verifyPurchase(purchase: ProductPurchase | SubscriptionPurchase): Promise<boolean> {
    try {
      // 在开发阶段，我们简单验证购买对象的完整性
      if (!purchase.transactionId || !purchase.productId) {
        return false;
      }
      
      // 生产环境中，这里应该：
      // 1. 将收据发送到服务器
      // 2. 服务器向Apple/Google验证收据
      // 3. 返回验证结果
      
      console.log('✅ Purchase verification passed (development mode)');
      return true;
    } catch (error) {
      console.error('❌ Purchase verification failed:', error);
      return false;
    }
  }

  // 获取本地产品ID
  private getLocalProductId(storeProductId: string): string {
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    const productIds = PRODUCT_IDS[platform];
    
    for (const [localId, storeId] of Object.entries(productIds)) {
      if (storeId === storeProductId) {
        return localId;
      }
    }
    
    return storeProductId;
  }

  // 根据产品ID获取周期
  private getPeriodFromProductId(productId: string): string {
    if (productId.includes('monthly')) return 'monthly';
    if (productId.includes('yearly')) return 'yearly';
    if (productId.includes('lifetime')) return 'lifetime';
    return 'unknown';
  }

  // 清理资源
  async cleanup(): Promise<void> {
    try {
      if (this.isInitialized) {
        await endConnection();
        this.isInitialized = false;
        console.log('✅ Payment service cleaned up');
      }
    } catch (error) {
      console.error('❌ Payment cleanup failed:', error);
    }
  }

  // 获取产品详情（用于调试）
  async getProductDetails(): Promise<void> {
    console.log('📊 Product Details:');
    console.log('Subscriptions:', this.subscriptions);
    console.log('Products:', this.products);
  }
}

export default new RealPaymentService();