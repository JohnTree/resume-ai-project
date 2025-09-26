import { Alert, Platform } from 'react-native';

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
  error?: string;
}

class PaymentService {
  private products: PaymentProduct[] = [
    {
      id: 'monthly_pro',
      name: '月度Pro会员',
      price: '19.9',
      period: 'monthly',
      type: 'subscription'
    },
    {
      id: 'yearly_pro',
      name: '年度Pro会员',
      price: '99.9',
      period: 'yearly',
      type: 'subscription'
    },
    {
      id: 'lifetime_pro',
      name: '终身Pro会员',
      price: '299.9',
      period: 'lifetime',
      type: 'consumable'
    }
  ];

  // 初始化支付服务
  async initialize(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        // 初始化Apple Pay / In-App Purchase
        return await this.initializeApplePay();
      } else {
        // 初始化Google Pay / 其他支付方式
        return await this.initializeGooglePay();
      }
    } catch (error) {
      console.error('Payment service initialization failed:', error);
      return false;
    }
  }

  // 获取可用产品
  async getProducts(): Promise<PaymentProduct[]> {
    try {
      // 从应用商店获取产品信息
      return this.products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  // 购买产品
  async purchaseProduct(productId: string): Promise<PaymentResult> {
    try {
      const product = this.products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (Platform.OS === 'ios') {
        return await this.purchaseWithApplePay(product);
      } else {
        return await this.purchaseWithGooglePay(product);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 恢复购买
  async restorePurchases(): Promise<PaymentResult> {
    try {
      if (Platform.OS === 'ios') {
        return await this.restoreApplePurchases();
      } else {
        return await this.restoreGooglePurchases();
      }
    } catch (error) {
      console.error('Restore purchases failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
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
      // 这里应该调用后端API检查用户的订阅状态
      // 暂时返回模拟数据
      return {
        isActive: false
      };
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return { isActive: false };
    }
  }

  // Apple Pay相关方法
  private async initializeApplePay(): Promise<boolean> {
    try {
      // 这里集成react-native-iap或其他iOS支付SDK
      console.log('Initializing Apple Pay...');
      return true;
    } catch (error) {
      console.error('Apple Pay initialization failed:', error);
      return false;
    }
  }

  private async purchaseWithApplePay(product: PaymentProduct): Promise<PaymentResult> {
    try {
      // 模拟Apple Pay购买流程
      console.log('Processing Apple Pay purchase for:', product.name);
      
      // 显示Apple Pay支付界面
      await this.simulatePaymentProcess();
      
      return {
        success: true,
        transactionId: `apple_${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Apple Pay failed'
      };
    }
  }

  private async restoreApplePurchases(): Promise<PaymentResult> {
    try {
      console.log('Restoring Apple purchases...');
      await this.simulatePaymentProcess();
      
      return {
        success: true,
        transactionId: 'restored_apple'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to restore Apple purchases'
      };
    }
  }

  // Google Pay相关方法
  private async initializeGooglePay(): Promise<boolean> {
    try {
      console.log('Initializing Google Pay...');
      return true;
    } catch (error) {
      console.error('Google Pay initialization failed:', error);
      return false;
    }
  }

  private async purchaseWithGooglePay(product: PaymentProduct): Promise<PaymentResult> {
    try {
      console.log('Processing Google Pay purchase for:', product.name);
      await this.simulatePaymentProcess();
      
      return {
        success: true,
        transactionId: `google_${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google Pay failed'
      };
    }
  }

  private async restoreGooglePurchases(): Promise<PaymentResult> {
    try {
      console.log('Restoring Google purchases...');
      await this.simulatePaymentProcess();
      
      return {
        success: true,
        transactionId: 'restored_google'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to restore Google purchases'
      };
    }
  }

  // 模拟支付处理过程
  private simulatePaymentProcess(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 90%成功率的模拟
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Payment processing failed'));
        }
      }, 2000);
    });
  }

  // 验证收据
  async verifyReceipt(receipt: string): Promise<boolean> {
    try {
      // 这里应该调用后端API验证收据
      console.log('Verifying receipt:', receipt);
      return true;
    } catch (error) {
      console.error('Receipt verification failed:', error);
      return false;
    }
  }

  // 取消订阅
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      // 这里应该调用相应平台的取消订阅API
      console.log('Cancelling subscription:', subscriptionId);
      return true;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  }
}

export default new PaymentService();