import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

// 导入页面组件
import HomeScreen from '../screens/HomeScreen';
import TemplateSelectionScreen from '../screens/TemplateSelectionScreen';
import ResumeEditorScreen from '../screens/ResumeEditorScreen';
import ResumePreviewScreen from '../screens/ResumePreviewScreen';
import ResumeListScreen from '../screens/ResumeListScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProUpgradeScreen from '../screens/ProUpgradeScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: '简历大师' }}
        />
        <Stack.Screen 
          name="TemplateSelection" 
          component={TemplateSelectionScreen} 
          options={{ title: '选择模板' }}
        />
        <Stack.Screen 
          name="ResumeEditor" 
          component={ResumeEditorScreen} 
          options={{ title: '编辑简历' }}
        />
        <Stack.Screen 
          name="ResumePreview" 
          component={ResumePreviewScreen} 
          options={{ title: '预览简历' }}
        />
        <Stack.Screen 
          name="ResumeList" 
          component={ResumeListScreen} 
          options={{ title: '我的简历' }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: '登录' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ title: '个人中心' }}
        />
        <Stack.Screen 
          name="ProUpgrade" 
          component={ProUpgradeScreen} 
          options={{ 
            title: '升级Pro',
            presentation: 'modal'
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}