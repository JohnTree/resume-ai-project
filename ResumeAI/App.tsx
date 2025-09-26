import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';
import { setupTestAuth } from './src/utils/testAuth';

export default function App() {
  useEffect(() => {
    // 在开发环境下自动设置测试认证
    setupTestAuth();
  }, []);

  return (
    <UserProvider>
      <PaperProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </PaperProvider>
    </UserProvider>
  );
}
