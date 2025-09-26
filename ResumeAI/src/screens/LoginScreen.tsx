import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    // 模拟登录/注册逻辑
    if (username === 'admin' && password === 'admin') {
      Alert.alert('登录成功', '欢迎使用简历大师！', [
        { text: '确定', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('登录失败', '用户名或密码错误');
    }
  };

  const handleGuestLogin = () => {
    Alert.alert('游客登录', '以游客身份继续使用', [
      { text: '确定', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>简历大师</Text>
          <Text style={styles.subtitle}>
            {isLogin ? '登录您的账户' : '创建新账户'}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.formContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, isLogin && styles.activeTab]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
              登录
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isLogin && styles.activeTab]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
              注册
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#64748b" />
            <TextInput
              style={styles.input}
              placeholder="用户名"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
            <TextInput
              style={styles.input}
              placeholder="密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#64748b" />
              <TextInput
                style={styles.input}
                placeholder="邮箱（可选）"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              style={styles.gradientButton}
            >
              <Text style={styles.authButtonText}>
                {isLogin ? '登录' : '注册'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
            <Text style={styles.guestButtonText}>游客登录</Text>
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>忘记密码？</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>登录后享受更多功能</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="cloud-outline" size={16} color="#6366f1" />
              <Text style={styles.featureText}>云端同步简历</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#6366f1" />
              <Text style={styles.featureText}>数据安全保护</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="star-outline" size={16} color="#6366f1" />
              <Text style={styles.featureText}>专属Pro功能</Text>
            </View>
          </View>
        </View>
      </View>
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
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: 'white',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  authButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  authButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  guestButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '500',
  },
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: '#64748b',
    fontSize: 14,
  },
  features: {
    marginTop: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#64748b',
  },
});