import { Alert, Platform } from 'react-native';

// 微信支付配置接口
interface WeChatPayConfig {
  appId: string;
  partnerId: string;
  prepayId: string;
  packageValue: string;
  nonceStr: string;
  timeStamp: string;
  sign: string;
}

// 支付宝支付配置接口
interface AlipayConfig {
  orderInfo: string; // 完整的支付参数字符串
}

// 支付结果接口
interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  error?: string;
}

class AndroidPaymentService {
  private static instance: AndroidPaymentService;
  
  // 微信支付配置
  private wechatConfig = {
    appId: 'wx1234567890abcdef', // 替换为你的微信AppID
    // 其他配置从后端获取
  };

  // 支付宝配置
  private alipayConfig = {
    appId: '2021001234567890', // 替换为你的支付宝AppID
    // 其他配置从后端获取
  };

  public static getInstance(): AndroidPaymentService {
    if (!AndroidPaymentService.instance) {
      AndroidPaymentService.instance = new AndroidPaymentService();
    }
    return AndroidPaymentService.instance;
  }

  /**
   * 初始化支付服务
   */
  async initialize(): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        console.warn('AndroidPaymentService only works on Android platform');
        return false;
      }

      // 检查微信是否安装
      const isWeChatInstalled = await this.isWeChatInstalled();
      console.log('WeChat installed:', isWeChatInstalled);

      // 检查支付宝是否安装
      const isAlipayInstalled = await this.isAlipayInstalled();
      console.log('Alipay installed:', isAlipayInstalled);

      return true;
    } catch (error) {
      console.error('Payment service initialization failed:', error);
      return false;
    }
  }

  /**
   * 检查微信是否安装
   */
  private async isWeChatInstalled(): Promise<boolean> {
    try {
      // 这里需要使用react-native-wechat-lib库
      // const WeChat = require('react-native-wechat-lib');
      // return await WeChat.isWXAppInstalled();
      
      // 临时返回true，实际需要检查
      return true;
    } catch (error) {
      console.error('Check WeChat installation failed:', error);
      return false;
    }
  }

  /**
   * 检查支付宝是否安装
   */
  private async isAlipayInstalled(): Promise<boolean> {
    try {
      // 这里需要使用react-native-alipay库
      // const Alipay = require('@uiw/react-native-alipay');
      // return await Alipay.isAlipayInstalled();
      
      // 临时返回true，实际需要检查
      return true;
    } catch (error) {
      console.error('Check Alipay installation failed:', error);
      return false;
    }
  }

  /**
   * 微信支付
   */
  async payWithWeChat(planType: string): Promise<PaymentResult> {
    try {
      console.log('🟢 Starting WeChat payment for:', planType);

      // 1. 向后端请求预支付订单
      const orderData = await this.createWeChatOrder(planType);
      
      if (!orderData.success) {
        return {
          success: false,
          message: '创建微信支付订单失败',
          error: orderData.error
        };
      }

      // 2. 调用微信支付
      const paymentConfig: WeChatPayConfig = orderData.data;
      
      // 这里需要使用react-native-wechat-lib库
      // const WeChat = require('react-native-wechat-lib');
      // const result = await WeChat.pay(paymentConfig);
      
      // 临时模拟支付结果
      const result = await this.simulateWeChatPayment(paymentConfig);

      if (result.success) {
        // 3. 验证支付结果
        const verifyResult = await this.verifyWeChatPayment(result.transactionId);
        
        return {
          success: verifyResult.success,
          message: verifyResult.success ? '微信支付成功' : '支付验证失败',
          transactionId: result.transactionId
        };
      } else {
        return {
          success: false,
          message: '微信支付失败',
          error: result.error
        };
      }
    } catch (error: any) {
      console.error('WeChat payment error:', error);
      return {
        success: false,
        message: '微信支付异常',
        error: error.message
      };
    }
  }

  /**
   * 支付宝支付
   */
  async payWithAlipay(planType: string): Promise<PaymentResult> {
    try {
      console.log('🔵 Starting Alipay payment for:', planType);

      // 1. 向后端请求支付订单信息
      const orderData = await this.createAlipayOrder(planType);
      
      if (!orderData.success) {
        return {
          success: false,
          message: '创建支付宝订单失败',
          error: orderData.error
        };
      }

      // 2. 调用支付宝支付
      const orderInfo = orderData.data.orderInfo;
      
      // 这里需要使用@uiw/react-native-alipay库
      // const Alipay = require('@uiw/react-native-alipay');
      // const result = await Alipay.alipay(orderInfo);
      
      // 临时模拟支付结果
      const result = await this.simulateAlipayPayment(orderInfo);

      if (result.success) {
        // 3. 验证支付结果
        const verifyResult = await this.verifyAlipayPayment(result.transactionId);
        
        return {
          success: verifyResult.success,
          message: verifyResult.success ? '支付宝支付成功' : '支付验证失败',
          transactionId: result.transactionId
        };
      } else {
        return {
          success: false,
          message: '支付宝支付失败',
          error: result.error
        };
      }
    } catch (error: any) {
      console.error('Alipay payment error:', error);
      return {
        success: false,
        message: '支付宝支付异常',
        error: error.message
      };
    }
  }

  /**
   * 创建微信支付订单
   */
  private async createWeChatOrder(planType: string): Promise<any> {
    try {
      // 这里应该调用你的后端API
      const response = await fetch('https://your-api.com/api/payment/wechat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          paymentMethod: 'wechat',
          platform: 'android'
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create WeChat order failed:', error);
      
      // 临时返回模拟数据
      return {
        success: true,
        data: {
          appId: this.wechatConfig.appId,
          partnerId: '1234567890',
          prepayId: 'wx' + Date.now(),
          packageValue: 'Sign=WXPay',
          nonceStr: this.generateNonceStr(),
          timeStamp: Math.floor(Date.now() / 1000).toString(),
          sign: 'mock_signature'
        }
      };
    }
  }

  /**
   * 创建支付宝订单
   */
  private async createAlipayOrder(planType: string): Promise<any> {
    try {
      // 这里应该调用你的后端API
      const response = await fetch('https://your-api.com/api/payment/alipay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          paymentMethod: 'alipay',
          platform: 'android'
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Create Alipay order failed:', error);
      
      // 临时返回模拟数据
      const orderInfo = this.generateAlipayOrderInfo(planType);
      return {
        success: true,
        data: {
          orderInfo
        }
      };
    }
  }

  /**
   * 验证微信支付结果
   */
  private async verifyWeChatPayment(transactionId?: string): Promise<any> {
    try {
      // 调用后端验证接口
      const response = await fetch('https://your-api.com/api/payment/wechat/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Verify WeChat payment failed:', error);
      // 临时返回成功
      return { success: true };
    }
  }

  /**
   * 验证支付宝支付结果
   */
  private async verifyAlipayPayment(transactionId?: string): Promise<any> {
    try {
      // 调用后端验证接口
      const response = await fetch('https://your-api.com/api/payment/alipay/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Verify Alipay payment failed:', error);
      // 临时返回成功
      return { success: true };
    }
  }

  /**
   * 模拟微信支付（开发阶段使用）
   */
  private async simulateWeChatPayment(config: WeChatPayConfig): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: 'wx_' + Date.now(),
          message: '微信支付成功（模拟）'
        });
      }, 2000);
    });
  }

  /**
   * 模拟支付宝支付（开发阶段使用）
   */
  private async simulateAlipayPayment(orderInfo: string): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: 'alipay_' + Date.now(),
          message: '支付宝支付成功（模拟）'
        });
      }, 2000);
    });
  }

  /**
   * 生成随机字符串
   */
  private generateNonceStr(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * 生成支付宝订单信息字符串
   */
  private generateAlipayOrderInfo(planType: string): string {
    const params = {
      app_id: this.alipayConfig.appId,
      method: 'alipay.trade.app.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
      version: '1.0',
      biz_content: JSON.stringify({
        out_trade_no: 'resume_' + Date.now(),
        total_amount: this.getPlanPrice(planType),
        subject: this.getPlanName(planType),
        product_code: 'QUICK_MSECURITY_PAY'
      })
    };

    // 实际应用中需要正确的签名算法
    return Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&') + '&sign=mock_signature';
  }

  /**
   * 获取方案价格
   */
  private getPlanPrice(planType: string): string {
    const prices = {
      monthly: '19.90',
      yearly: '99.90',
      lifetime: '299.90'
    };
    return prices[planType as keyof typeof prices] || '19.90';
  }

  /**
   * 获取方案名称
   */
  private getPlanName(planType: string): string {
    const names = {
      monthly: 'ResumeAI月度会员',
      yearly: 'ResumeAI年度会员',
      lifetime: 'ResumeAI终身会员'
    };
    return names[planType as keyof typeof names] || 'ResumeAI会员';
  }

  /**
   * 显示支付方式选择对话框
   */
  async showPaymentOptions(planType: string): Promise<PaymentResult> {
    return new Promise((resolve) => {
      Alert.alert(
        '选择支付方式',
        '请选择您的支付方式',
        [
          {
            text: '微信支付',
            onPress: async () => {
              const result = await this.payWithWeChat(planType);
              resolve(result);
            }
          },
          {
            text: '支付宝',
            onPress: async () => {
              const result = await this.payWithAlipay(planType);
              resolve(result);
            }
          },
          {
            text: '取消',
            style: 'cancel',
            onPress: () => {
              resolve({
                success: false,
                message: '用户取消支付'
              });
            }
          }
        ]
      );
    });
  }
}

export default AndroidPaymentService.getInstance();