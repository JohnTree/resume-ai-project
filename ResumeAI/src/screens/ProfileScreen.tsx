import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useUser } from '../context/UserContext';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useUser();

  const menuItems = [
    {
      icon: 'person-outline',
      title: '个人信息',
      subtitle: '编辑您的个人资料',
      onPress: () => Alert.alert('个人信息', '功能开发中...'),
    },
    {
      icon: 'star-outline',
      title: user?.isPro ? '管理订阅' : '升级Pro',
      subtitle: user?.isPro ? '管理您的Pro订阅' : '解锁全部功能',
      onPress: () => {
        if (user?.isPro) {
          Alert.alert('订阅管理', '您已是Pro用户！');
        } else {
          navigation.navigate('ProUpgrade');
        }
      },
      isPro: !user?.isPro,
    },
    {
      icon: 'cloud-outline',
      title: '数据同步',
      subtitle: '云端备份您的简历',
      onPress: () => Alert.alert('数据同步', '功能开发中...'),
    },
    {
      icon: 'settings-outline',
      title: '设置',
      subtitle: '应用偏好设置',
      onPress: () => Alert.alert('设置', '功能开发中...'),
    },
    {
      icon: 'help-circle-outline',
      title: '帮助与反馈',
      subtitle: '获取帮助或提供反馈',
      onPress: () => Alert.alert('帮助与反馈', '功能开发中...'),
    },
    {
      icon: 'information-circle-outline',
      title: '关于我们',
      subtitle: '了解简历大师',
      onPress: () => Alert.alert('关于我们', '简历大师 v1.0.0'),
    },
  ];

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { 
        text: '退出', 
        style: 'destructive',
        onPress: async () => {
          await logout();
          Alert.alert('已退出', '您已成功退出登录');
          navigation.navigate('Home');
        }
      },
    ]);
  };

  const formatSubscriptionInfo = () => {
    if (!user?.isPro) return null;
    
    if (user.subscriptionType === 'lifetime') {
      return '终身会员';
    }
    
    const expiryDate = user.subscriptionExpiryDate;
    if (expiryDate) {
      const formattedDate = expiryDate.toLocaleDateString('zh-CN');
      return `${user.subscriptionType === 'monthly' ? '月度' : '年度'}会员 · 到期时间：${formattedDate}`;
    }
    
    return 'Pro会员';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 用户信息卡片 */}
        <LinearGradient
          colors={user?.isPro ? ['#f59e0b', '#f97316'] : ['#6366f1', '#8b5cf6']}
          style={styles.userCard}
        >
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color="white" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.name || '游客'} {user?.isPro && '👑'}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email || '未登录'}
              </Text>
              <View style={styles.userBadge}>
                <Ionicons 
                  name={user?.isPro ? "star" : "star-outline"} 
                  size={12} 
                  color={user?.isPro ? "#fbbf24" : "#94a3b8"} 
                />
                <Text style={styles.userBadgeText}>
                  {user?.isPro ? 'Pro用户' : '免费用户'}
                </Text>
              </View>
              {user?.isPro && (
                <Text style={styles.subscriptionInfo}>
                  {formatSubscriptionInfo()}
                </Text>
              )}
            </View>
          </View>
          
          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="create-outline" size={16} color={user?.isPro ? '#f59e0b' : '#6366f1'} />
            <Text style={[styles.editProfileText, { color: user?.isPro ? '#f59e0b' : '#6366f1' }]}>编辑</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* 统计信息 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>简历数量</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>下载次数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>使用天数</Text>
          </View>
        </View>

        {/* Pro升级卡片 - 只对非Pro用户显示 */}
        {!user?.isPro && (
          <View style={styles.proPromotionContainer}>
            <LinearGradient
              colors={['#f59e0b', '#f97316']}
              style={styles.proPromotionCard}
            >
              <View style={styles.proPromotionContent}>
                <Text style={styles.proPromotionTitle}>👑 升级Pro版本</Text>
                <Text style={styles.proPromotionDescription}>
                  解锁所有模板和高级功能
                </Text>
                <TouchableOpacity 
                  style={styles.proPromotionButton}
                  onPress={() => navigation.navigate('ProUpgrade')}
                >
                  <Text style={styles.proPromotionButtonText}>立即升级</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.proPromotionIcon}>
                <Ionicons name="star" size={40} color="rgba(255, 255, 255, 0.3)" />
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Pro特权展示 - 只对Pro用户显示 */}
        {user?.isPro && (
          <View style={styles.proFeaturesContainer}>
            <View style={styles.proFeaturesCard}>
              <Text style={styles.proFeaturesTitle}>🎉 您的Pro特权</Text>
              <View style={styles.proFeaturesList}>
                <View style={styles.proFeatureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.proFeatureText}>无限制使用所有模板</Text>
                </View>
                <View style={styles.proFeatureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.proFeatureText}>AI智能优化功能</Text>
                </View>
                <View style={styles.proFeatureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.proFeatureText}>高清PDF导出</Text>
                </View>
                <View style={styles.proFeatureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.proFeatureText}>优先客服支持</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 菜单列表 */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[
                  styles.menuIcon,
                  item.isPro && styles.menuIconPro
                ]}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={item.isPro ? '#f59e0b' : '#6366f1'} 
                  />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* 退出登录 */}
        {user && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>简历大师 v1.0.0</Text>
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
  userCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 4,
  },
  userBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  subscriptionInfo: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  proPromotionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  proPromotionCard: {
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  proPromotionContent: {
    flex: 1,
  },
  proPromotionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  proPromotionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  proPromotionButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  proPromotionButtonText: {
    color: '#f59e0b',
    fontWeight: '600',
    fontSize: 14,
  },
  proPromotionIcon: {
    marginLeft: 16,
  },
  proFeaturesContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  proFeaturesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  proFeaturesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  proFeaturesList: {
    gap: 12,
  },
  proFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proFeatureText: {
    fontSize: 14,
    color: '#374151',
  },
  menuContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconPro: {
    backgroundColor: '#fef3c7',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});