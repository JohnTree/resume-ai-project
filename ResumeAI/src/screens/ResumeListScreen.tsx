import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Resume } from '../types';

type ResumeListNavigationProp = StackNavigationProp<RootStackParamList, 'ResumeList'>;

interface Props {
  navigation: ResumeListNavigationProp;
}

export default function ResumeListScreen({ navigation }: Props) {
  // 模拟简历数据
  const [resumes] = useState<Resume[]>([
    {
      id: '1',
      title: '前端开发工程师简历',
      template: 'modern-1',
      data: {
        personalInfo: {
          name: '张三',
          email: 'zhangsan@example.com',
          phone: '138-0000-0000',
          address: '北京市朝阳区',
          summary: '具有3年前端开发经验...',
        },
        experience: [],
        education: [],
        skills: [],
      },
      userId: 'user-1',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
    },
    {
      id: '2',
      title: '产品经理简历',
      template: 'classic-1',
      data: {
        personalInfo: {
          name: '李四',
          email: 'lisi@example.com',
          phone: '139-0000-0000',
          address: '上海市浦东新区',
          summary: '5年产品管理经验...',
        },
        experience: [],
        education: [],
        skills: [],
      },
      userId: 'user-1',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
    },
  ]);

  const handleResumeAction = (resumeId: string, action: string) => {
    switch (action) {
      case 'edit':
        navigation.navigate('ResumeEditor', { templateId: 'modern-1', resumeId });
        break;
      case 'preview':
        navigation.navigate('ResumePreview', { resumeId });
        break;
      case 'duplicate':
        Alert.alert('复制简历', '简历已复制');
        break;
      case 'delete':
        Alert.alert('删除简历', '确定要删除这份简历吗？', [
          { text: '取消', style: 'cancel' },
          { text: '删除', style: 'destructive', onPress: () => {} },
        ]);
        break;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部操作栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的简历</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('TemplateSelection')}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.createButtonText}>新建</Text>
        </TouchableOpacity>
      </View>

      {/* 简历列表 */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {resumes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyStateTitle}>暂无简历</Text>
            <Text style={styles.emptyStateDescription}>
              点击右上角"新建"按钮创建您的第一份简历
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('TemplateSelection')}
            >
              <Text style={styles.emptyStateButtonText}>立即创建</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resumeList}>
            {resumes.map((resume) => (
              <View key={resume.id} style={styles.resumeCard}>
                <TouchableOpacity
                  style={styles.resumeContent}
                  onPress={() => handleResumeAction(resume.id, 'preview')}
                >
                  <View style={styles.resumePreview}>
                    <View style={styles.previewPlaceholder}>
                      <Ionicons name="document-text-outline" size={32} color="#6366f1" />
                    </View>
                  </View>
                  
                  <View style={styles.resumeInfo}>
                    <Text style={styles.resumeTitle}>{resume.title}</Text>
                    <Text style={styles.resumeSubtitle}>
                      {resume.data.personalInfo.name}
                    </Text>
                    <View style={styles.resumeMeta}>
                      <Text style={styles.resumeDate}>
                        更新于 {formatDate(resume.updatedAt)}
                      </Text>
                      <View style={styles.templateTag}>
                        <Text style={styles.templateTagText}>经典模板</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* 操作按钮 */}
                <View style={styles.resumeActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleResumeAction(resume.id, 'edit')}
                  >
                    <Ionicons name="create-outline" size={18} color="#6366f1" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleResumeAction(resume.id, 'duplicate')}
                  >
                    <Ionicons name="copy-outline" size={18} color="#64748b" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleResumeAction(resume.id, 'delete')}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  emptyStateButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resumeList: {
    gap: 16,
  },
  resumeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resumeContent: {
    flexDirection: 'row',
    padding: 16,
  },
  resumePreview: {
    marginRight: 16,
  },
  previewPlaceholder: {
    width: 60,
    height: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resumeInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resumeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  resumeSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  resumeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumeDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  templateTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  templateTagText: {
    fontSize: 10,
    color: '#6366f1',
    fontWeight: '500',
  },
  resumeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
});