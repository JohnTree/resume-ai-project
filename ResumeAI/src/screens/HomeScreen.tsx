import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useUser } from '../context/UserContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useUser();
  const features = [
    {
      icon: 'document-text-outline',
      title: '专业模板',
      description: '多种精美简历模板，适合不同行业',
      color: '#6366f1',
    },
    {
      icon: 'create-outline',
      title: '智能编辑',
      description: '简单易用的编辑器，实时预览效果',
      color: '#8b5cf6',
    },
    {
      icon: 'download-outline',
      title: 'PDF导出',
      description: '一键生成高质量PDF简历',
      color: '#06b6d4',
    },
    {
      icon: 'cloud-outline',
      title: '云端同步',
      description: '数据安全存储，随时随地访问',
      color: '#10b981',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 头部渐变背景 */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.title}>简历大师</Text>
            <Text style={styles.subtitle}>专业简历制作工具</Text>
            
            {/* 用户信息/登录按钮 */}
            {user ? (
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Ionicons name="person" size={20} color="#6366f1" />
                <Text style={styles.loginText}>
                  {user.name} {user.isPro && '👑'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Ionicons name="person-outline" size={20} color="#6366f1" />
                <Text style={styles.loginText}>登录/注册</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* 主要功能按钮 */}
        <View style={styles.mainActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => navigation.navigate('TemplateSelection')}
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              style={styles.gradientButton}
            >
              <Ionicons name="add-circle-outline" size={24} color="white" />
              <Text style={styles.primaryButtonText}>创建新简历</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('ResumeList')}
          >
            <Ionicons name="folder-outline" size={24} color="#6366f1" />
            <Text style={styles.secondaryButtonText}>我的简历</Text>
          </TouchableOpacity>
        </View>

        {/* 功能特色 */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>为什么选择简历大师？</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <Ionicons name={feature.icon as any} size={24} color="white" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pro功能推广 */}
        <View style={styles.proSection}>
          <LinearGradient
            colors={['#f59e0b', '#f97316']}
            style={styles.proCard}
          >
            <View style={styles.proHeader}>
              <Text style={styles.proTitle}>👑 PRO</Text>
              <Text style={styles.proSubtitle}>解锁全部功能</Text>
            </View>
            <Text style={styles.proDescription}>
              • 无限制使用所有模板{'\n'}
              • 高级编辑功能{'\n'}
              • 优先客服支持{'\n'}
              • 无水印导出
            </Text>
            <TouchableOpacity 
              style={styles.proButton}
              onPress={() => navigation.navigate('ProUpgrade')}
            >
              <Text style={styles.proButtonText}>立即升级</Text>
            </TouchableOpacity>
          </LinearGradient>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  loginText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  mainActions: {
    padding: 20,
    gap: 15,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButton: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    gap: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
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
    gap: 15,
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  proSection: {
    padding: 20,
    paddingBottom: 40,
  },
  proCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  proHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  proTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  proSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  proDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  proButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  proButtonText: {
    color: '#f59e0b',
    fontWeight: '600',
    fontSize: 16,
  },
});