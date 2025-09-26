import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import AndroidPaymentService from '../services/AndroidPaymentService';
// import RealPaymentService from '../services/RealPaymentService';

type ProUpgradeNavigationProp = StackNavigationProp<RootStackParamList, 'ProUpgrade'>;

interface Props {
  navigation: ProUpgradeNavigationProp;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  discount?: string;
  popular?: boolean;
  features: string[];
}

export default function ProUpgradeScreen({ navigation }: Props) {
  const { upgradeToPro } = useUser();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useRealPayment, setUseRealPayment] = useState(false);
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  
  // 检查是否在 Expo Go 环境中
  const isExpoGo = __DEV__ && !process.env.EAS_BUILD;

  const pricingPlans: PricingPlan[] = [
    {
      id: 'monthly',
      name: '月度会员',
      price: '¥19.9',
      period: '每月',
      features: [
        '解锁所有高级模板',
        'AI智能优化',
        'PDF导出功能',
        '多份简历管理',
        '优先客服支持'
      ]
    },
    {
      id: 'yearly',
      name: '年度会员',
      price: '¥99.9',
      originalPrice: '¥238.8',
      period: '每年',
      discount: '节省58%',
      popular: true,
      features: [
        '包含月度会员所有功能',
        '年度专属模板',
        '简历数据分析报告',
        '求职指导资料',
        '1对1简历优化咨询'
      ]
    },
    {
      id: 'lifetime',
      name: '终身会员',
      price: '¥299.9',
      originalPrice: '¥1194',
      period: '一次性付费',
      discount: '限时75折',
      features: [
        '包含年度会员所有功能',
        '终身免费更新',
        '新功能抢先体验',
        '专属VIP客服',
        '简历模板定制服务'
      ]
    }
  ];

  const proFeatures = [
    {
      icon: 'document-text-outline',
      title: '高级模板',
      description: '50+ 精美专业模板，涵盖各行各业'
    },
    {
      icon: 'sparkles-outline',
      title: 'AI智能优化',
      description: '基于大数据的简历内容智能优化建议'
    },
    {
      icon: 'download-outline',
      title: 'PDF导出',
      description: '高清PDF导出，支持自定义水印'
    },
    {
      icon: 'folder-outline',
      title: '多份简历',
      description: '创建和管理多份针对性简历'
    },
    {
      icon: 'analytics-outline',
      title: '数据分析',
      description: '简历浏览数据和求职成功率分析'
    },
    {
      icon: 'headset-outline',
      title: '专属客服',
      description: '7x24小时专属客服支持'
    }
  ];

  // 初始化支付服务
  useEffect(() => {
    const initializePayment = async () => {
      if (useRealPayment && !isExpoGo) {
        console.log('🔄 Initializing real payment service...');
        try {
          const RealPaymentService = require('../services/RealPaymentService').default;
          const initialized = await RealPaymentService.initialize();
          setPaymentInitialized(initialized);
          
          if (initialized) {
            // 获取产品详情用于调试
            await RealPaymentService.getProductDetails();
          } else {
            Alert.alert('支付服务初始化失败', '请检查网络连接或稍后重试');
          }
        } catch (error) {
          console.error('Payment service initialization failed:', error);
          setPaymentInitialized(false);
        }
      } else if (useRealPayment && isExpoGo) {
        Alert.alert(
          '不支持真实支付',
          'Expo Go 环境不支持真实支付功能，请使用模拟支付模式进行测试。\n\n要使用真实支付，需要构建独立的 App。',
          [{ text: '知道了', onPress: () => setUseRealPayment(false) }]
        );
      }
    };
    
    initializePayment();
  }, [useRealPayment, isExpoGo]);

  const handlePurchase = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      let result;
      
      if (useRealPayment && !isExpoGo) {
        // 使用真实支付
        console.log(`🛒 Starting real purchase for: ${selectedPlan}`);
        
        if (Platform.OS === 'android') {
          // Android平台 - 使用微信支付/支付宝
          try {
            result = await AndroidPaymentService.showPaymentOptions(selectedPlan);
            
            if (result.success) {
              // 更新用户Pro状态
              const upgraded = await upgradeToPro(selectedPlan);
              
              if (upgraded) {
                Alert.alert(
                  '🎉 购买成功！',
                  '恭喜您成为Pro会员，现在可以享受所有高级功能！',
                  [
                    {
                      text: '开始使用',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                Alert.alert('升级失败', '支付成功但升级失败，请联系客服');
              }
            } else if (result.message !== '用户取消支付') {
              Alert.alert('购买失败', result.message || '请稍后重试或联系客服');
            }
          } catch (error) {
            console.error('Android payment error:', error);
            Alert.alert('购买失败', '支付服务不可用，请检查微信和支付宝是否已安装');
          }
        } else {
          // iOS平台 - 使用App Store内购
          try {
            const RealPaymentService = require('../services/RealPaymentService').default;
            result = await RealPaymentService.purchaseProduct(selectedPlan);
            
            if (result.success) {
              // 更新用户Pro状态
              const upgraded = await upgradeToPro(selectedPlan);
              
              if (upgraded) {
                Alert.alert(
                  '🎉 购买成功！',
                  '恭喜您成为Pro会员，现在可以享受所有高级功能！',
                  [
                    {
                      text: '开始使用',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                Alert.alert('升级失败', '支付成功但升级失败，请联系客服');
              }
            } else {
              Alert.alert('购买失败', result.error || '请稍后重试或联系客服');
            }
          } catch (error) {
            console.error('iOS payment error:', error);
            Alert.alert('购买失败', 'App Store支付服务不可用');
          }
        }
      } else {
        // 使用模拟支付
        console.log(`🎭 Starting simulated purchase for: ${selectedPlan}`);
        
        if (Platform.OS === 'android') {
          // Android模拟支付 - 显示支付选项
          result = await AndroidPaymentService.showPaymentOptions(selectedPlan);
          
          if (result.success) {
            const upgraded = await upgradeToPro(selectedPlan);
            
            if (upgraded) {
              Alert.alert(
                '🎉 购买成功！（模拟）',
                `${result.message}\n\n注意：这是模拟购买，未实际扣费。`,
                [
                  {
                    text: '开始使用',
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            } else {
              Alert.alert('升级失败', '模拟支付成功但升级失败');
            }
          } else if (result.message !== '用户取消支付') {
            Alert.alert('模拟支付失败', result.message);
          }
        } else {
          // iOS模拟支付
          await simulatePayment();
          
          const upgraded = await upgradeToPro(selectedPlan);
          
          if (upgraded) {
            Alert.alert(
              '🎉 购买成功！（模拟）',
              '恭喜您成为Pro会员，现在可以享受所有高级功能！\n\n注意：这是模拟购买，未实际扣费。',
              [
                {
                  text: '开始使用',
                  onPress: () => navigation.goBack()
                }
              ]
            );
          } else {
            Alert.alert('升级失败', '模拟支付成功但升级失败');
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      Alert.alert('购买失败', error.message || '请稍后重试或联系客服');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulatePayment = () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  };

  const handleRestore = async () => {
    if (useRealPayment && paymentInitialized && !isExpoGo) {
      Alert.alert('恢复购买', '正在检查您的购买记录...', [
        { text: '取消', style: 'cancel' }
      ]);
      
      try {
        const RealPaymentService = require('../services/RealPaymentService').default;
        const result = await RealPaymentService.restorePurchases();
        
        if (result.success) {
          // 更新用户Pro状态
          const productId = result.productId || 'yearly'; // 默认年度
          const localProductId = getLocalProductId(productId);
          const upgraded = await upgradeToPro(localProductId);
          
          if (upgraded) {
            Alert.alert('恢复成功', '您的Pro会员已恢复！');
          } else {
            Alert.alert('恢复失败', '找到购买记录但恢复失败，请联系客服');
          }
        } else {
          Alert.alert('恢复失败', result.error || '没有找到有效的购买记录');
        }
      } catch (error: any) {
        console.error('Restore purchase error:', error);
        Alert.alert('恢复失败', '支付服务不可用');
      }
    } else {
      Alert.alert('恢复购买', isExpoGo ? 'Expo Go 环境不支持恢复购买功能' : '模拟模式下无法恢复购买');
    }
  };

  // 将商店产品ID转换为本地产品ID
  const getLocalProductId = (storeProductId: string): string => {
    if (storeProductId.includes('monthly')) return 'monthly';
    if (storeProductId.includes('yearly')) return 'yearly';
    if (storeProductId.includes('lifetime')) return 'lifetime';
    return 'yearly'; // 默认
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 开发者调试面板 */}
        <View style={styles.debugPanel}>
          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>
              {useRealPayment ? '🔴 真实支付模式' : '🟡 模拟支付模式'}
            </Text>
            <Switch
              value={useRealPayment}
              onValueChange={setUseRealPayment}
              trackColor={{ false: '#cbd5e1', true: '#10b981' }}
              thumbColor={useRealPayment ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          {useRealPayment && (
            <Text style={styles.debugStatus}>
              {isExpoGo 
                ? '⚠️ Expo Go 不支持真实支付' 
                : Platform.OS === 'android'
                  ? '🤖 Android: 微信支付 + 支付宝'
                  : paymentInitialized 
                    ? '🍎 iOS: App Store 内购已就绪' 
                    : '⏳ 正在初始化 iOS 支付服务...'
              }
            </Text>
          )}
          {!useRealPayment && (
            <Text style={styles.debugStatus}>
              💡 模拟模式：{Platform.OS === 'android' ? '显示支付选项但不扣费' : '不会实际扣费，用于开发测试'}
            </Text>
          )}
        </View>

        {/* 头部 */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={styles.crownContainer}>
              <Text style={styles.crownIcon}>👑</Text>
            </View>
            <Text style={styles.headerTitle}>升级到 Pro</Text>
            <Text style={styles.headerSubtitle}>
              解锁所有高级功能，让您的简历脱颖而出
            </Text>
          </View>
        </LinearGradient>

        {/* 功能特性 */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Pro 会员特权</Text>
          <View style={styles.featuresGrid}>
            {proFeatures.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon as any} size={24} color="#6366f1" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 价格方案 */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>选择您的方案</Text>
          
          {pricingPlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.pricingCard,
                selectedPlan === plan.id && styles.pricingCardSelected,
                plan.popular && styles.pricingCardPopular
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>最受欢迎</Text>
                </View>
              )}
              
              <View style={styles.pricingHeader}>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{plan.price}</Text>
                    <Text style={styles.period}>/{plan.period}</Text>
                    {plan.originalPrice && (
                      <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
                    )}
                  </View>
                  {plan.discount && (
                    <Text style={styles.discount}>{plan.discount}</Text>
                  )}
                </View>
                
                <View style={[
                  styles.radioButton,
                  selectedPlan === plan.id && styles.radioButtonSelected
                ]}>
                  {selectedPlan === plan.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
              
              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 购买按钮 */}
        <View style={styles.purchaseSection}>
          <TouchableOpacity
            style={[styles.purchaseButton, isProcessing && styles.purchaseButtonDisabled]}
            onPress={handlePurchase}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="card-outline" size={20} color="white" />
                <Text style={styles.purchaseButtonText}>
                  立即购买 {pricingPlans.find(p => p.id === selectedPlan)?.price}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
            <Text style={styles.restoreButtonText}>恢复购买</Text>
          </TouchableOpacity>
          
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              • 订阅将自动续费，可随时在设置中取消
            </Text>
            <Text style={styles.disclaimerText}>
              • 支持7天无理由退款
            </Text>
            <Text style={styles.disclaimerText}>
              • 购买即表示同意《服务条款》和《隐私政策》
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  crownContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  crownIcon: {
    fontSize: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  pricingSection: {
    padding: 20,
    paddingTop: 0,
  },
  pricingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative',
  },
  pricingCardSelected: {
    borderColor: '#6366f1',
  },
  pricingCardPopular: {
    borderColor: '#f59e0b',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  period: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  discount: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#6366f1',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  purchaseSection: {
    padding: 20,
    paddingTop: 0,
  },
  purchaseButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  purchaseButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  restoreButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  disclaimer: {
    gap: 4,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  debugPanel: {
    backgroundColor: '#f1f5f9',
    margin: 20,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  debugLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  debugStatus: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});