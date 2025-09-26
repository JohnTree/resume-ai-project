import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PaymentService from '../services/PaymentService';

export interface User {
  id: string;
  email: string;
  name: string;
  isPro: boolean;
  subscriptionType?: 'monthly' | 'yearly' | 'lifetime';
  subscriptionExpiryDate?: Date;
  createdAt: Date;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  upgradeToPro: (subscriptionType: string) => Promise<boolean>;
  checkProStatus: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser({
          ...parsedUser,
          createdAt: new Date(parsedUser.createdAt),
          subscriptionExpiryDate: parsedUser.subscriptionExpiryDate 
            ? new Date(parsedUser.subscriptionExpiryDate) 
            : undefined
        });
        
        // 检查订阅状态
        await checkProStatus();
      }
    } catch (error) {
      console.error('Failed to initialize user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // 模拟登录API调用
      const response = await simulateLogin(email, password);
      
      if (response.success) {
        const userData = response.user;
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // 模拟注册API调用
      const response = await simulateRegister(email, password, name);
      
      if (response.success) {
        const userData = response.user;
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeToPro = async (subscriptionType: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // 调用支付服务
      const paymentResult = await PaymentService.purchaseProduct(`${subscriptionType}_pro`);
      
      if (paymentResult.success) {
        // 更新用户Pro状态
        const updatedUser: User = {
          ...user,
          isPro: true,
          subscriptionType: subscriptionType as 'monthly' | 'yearly' | 'lifetime',
          subscriptionExpiryDate: calculateExpiryDate(subscriptionType)
        };
        
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        // 这里应该调用后端API更新用户状态
        await updateUserProStatus(updatedUser);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Upgrade to Pro failed:', error);
      return false;
    }
  };

  const checkProStatus = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // 检查本地订阅是否过期
      if (user.subscriptionExpiryDate && user.subscriptionExpiryDate < new Date()) {
        const updatedUser = { ...user, isPro: false };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        return false;
      }
      
      // 从服务器检查订阅状态
      const subscriptionStatus = await PaymentService.checkSubscriptionStatus();
      
      if (subscriptionStatus.isActive !== user.isPro) {
        const updatedUser = { 
          ...user, 
          isPro: subscriptionStatus.isActive,
          subscriptionExpiryDate: subscriptionStatus.expiryDate
        };
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return subscriptionStatus.isActive;
    } catch (error) {
      console.error('Failed to check Pro status:', error);
      return user?.isPro || false;
    }
  };

  const value: UserContextType = {
    user,
    isLoading,
    login,
    logout,
    register,
    upgradeToPro,
    checkProStatus,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// 辅助函数
const simulateLogin = async (email: string, password: string) => {
  return new Promise<{ success: boolean; user?: User }>((resolve) => {
    setTimeout(() => {
      if (email && password) {
        resolve({
          success: true,
          user: {
            id: '1',
            email,
            name: '用户',
            isPro: false,
            createdAt: new Date()
          }
        });
      } else {
        resolve({ success: false });
      }
    }, 1000);
  });
};

const simulateRegister = async (email: string, password: string, name: string) => {
  return new Promise<{ success: boolean; user?: User }>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        user: {
          id: Date.now().toString(),
          email,
          name,
          isPro: false,
          createdAt: new Date()
        }
      });
    }, 1000);
  });
};

const calculateExpiryDate = (subscriptionType: string): Date | undefined => {
  const now = new Date();
  
  switch (subscriptionType) {
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case 'yearly':
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    case 'lifetime':
      return undefined; // 终身会员无过期时间
    default:
      return undefined;
  }
};

const updateUserProStatus = async (user: User): Promise<void> => {
  try {
    // 这里应该调用后端API更新用户Pro状态
    console.log('Updating user Pro status:', user);
  } catch (error) {
    console.error('Failed to update user Pro status:', error);
  }
};