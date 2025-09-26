import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Template } from '../types';
import { useUser } from '../context/UserContext';

type TemplateSelectionNavigationProp = StackNavigationProp<RootStackParamList, 'TemplateSelection'>;

interface Props {
  navigation: TemplateSelectionNavigationProp;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

export default function TemplateSelectionScreen({ navigation }: Props) {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 模板数据 - 对应web端的8种模板
  const templates: Template[] = [
    {
      id: 'traditional',
      name: '📋 传统简历',
      preview: 'traditional',
      isPro: false,
      category: 'business',
    },
    {
      id: 'split',
      name: '🎯 双栏分割',
      preview: 'split',
      isPro: false,
      category: 'modern',
    },
    {
      id: 'colorful',
      name: '🌈 彩色卡片',
      preview: 'colorful',
      isPro: true,
      category: 'creative',
    },
    {
      id: 'tech',
      name: '⚡ 科技未来',
      preview: 'tech',
      isPro: true,
      category: 'tech',
    },
    {
      id: 'magazine',
      name: '🌸 优雅杂志',
      preview: 'magazine',
      isPro: true,
      category: 'creative',
    },
    {
      id: 'infographic',
      name: '📊 信息图表',
      preview: 'infographic',
      isPro: true,
      category: 'business',
    },
    {
      id: 'artistic',
      name: '🎨 创意艺术',
      preview: 'artistic',
      isPro: true,
      category: 'creative',
    },
    {
      id: 'minimal',
      name: '💼 商务简约',
      preview: 'minimal',
      isPro: true,
      category: 'business',
    },
    // 简约类别模板
    {
      id: 'clean',
      name: '🍃 清新简约',
      preview: 'clean',
      isPro: false,
      category: 'simple',
    },
    {
      id: 'elegant',
      name: '✨ 优雅简约',
      preview: 'elegant',
      isPro: true,
      category: 'simple',
    },
    {
      id: 'pure',
      name: '🤍 纯净简约',
      preview: 'pure',
      isPro: true,
      category: 'simple',
    },
  ];

  const categories = [
    { id: 'all', name: '全部', icon: 'grid-outline' },
    { id: 'business', name: '商务', icon: 'briefcase-outline' },
    { id: 'modern', name: '现代', icon: 'phone-portrait-outline' },
    { id: 'creative', name: '创意', icon: 'color-palette-outline' },
    { id: 'simple', name: '简约', icon: 'leaf-outline' },
    { id: 'tech', name: '科技', icon: 'code-slash-outline' },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const handleTemplateSelect = (template: Template) => {
    if (template.isPro && (!user || !user.isPro)) {
      // 跳转到Pro升级页面
      navigation.navigate('ProUpgrade');
      return;
    }
    
    navigation.navigate('ResumeEditor', { templateId: template.id });
  };

  const handleTemplatePreview = (template: Template) => {
    // 预览功能：使用默认数据预览模板
    const defaultData = {
      personalInfo: {
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '138-0000-0000',
        address: '北京市朝阳区',
        summary: '具有3年前端开发经验，熟练掌握React、Vue等主流框架，有丰富的移动端开发经验，注重代码质量和用户体验。',
      },
      experience: [
        {
          company: 'ABC科技有限公司',
          position: '前端开发工程师',
          startDate: '2021.03',
          endDate: '至今',
          description: '• 负责公司主要产品的前端开发工作\n• 参与产品架构设计和技术选型\n• 优化页面性能，提升用户体验',
        }
      ],
      education: [
        {
          school: '北京理工大学',
          degree: '计算机科学与技术 · 本科',
          startDate: '2017.09',
          endDate: '2021.06',
        }
      ],
      skills: ['JavaScript', 'React', 'Vue.js', 'TypeScript', 'Node.js', 'Git'],
    };

    navigation.navigate('ResumePreview', {
      resumeId: 'preview',
      resumeData: defaultData,
      templateId: template.id
    });
  };

  // 渲染模板预览组件 - 对应web端8种设计
  const renderTemplatePreview = (templateType: string) => {
    switch (templateType) {
      case 'traditional':
        return (
          <View style={[styles.templatePreview, { backgroundColor: 'white', borderWidth: 2, borderColor: '#000' }]}>
            <View style={styles.traditionalHeader}>
              <Text style={styles.traditionalName}>张三</Text>
              <Text style={styles.traditionalTitle}>前端工程师</Text>
              <View style={styles.traditionalContact}>
                <Text style={styles.traditionalContactText}>📧 邮箱</Text>
                <Text style={styles.traditionalContactText}>📱 电话</Text>
              </View>
            </View>
            <View style={styles.traditionalBody}>
              <View style={styles.traditionalSection}>
                <Text style={styles.traditionalSectionTitle}>工作经验</Text>
                <View style={[styles.previewLine, { backgroundColor: '#333', height: 2 }]} />
                <View style={[styles.previewLine, { backgroundColor: '#666', height: 2, marginTop: 4 }]} />
              </View>
            </View>
          </View>
        );

      case 'split':
        return (
          <View style={[styles.templatePreview, { flexDirection: 'row' }]}>
            <LinearGradient colors={['#2563eb', '#1d4ed8']} style={styles.splitLeft}>
              <View style={styles.splitAvatar}>
                <Text style={styles.splitAvatarText}>👤</Text>
              </View>
              <Text style={styles.splitName}>张三</Text>
              <Text style={styles.splitRole}>前端工程师</Text>
            </LinearGradient>
            <View style={styles.splitRight}>
              <Text style={styles.splitMainTitle}>个人简介</Text>
              <View style={[styles.previewLine, { backgroundColor: '#2563eb', height: 3, width: 40 }]} />
              <View style={[styles.previewLine, { backgroundColor: '#ccc', height: 2, marginTop: 8 }]} />
              <View style={[styles.previewLine, { backgroundColor: '#ccc', height: 2, marginTop: 4 }]} />
            </View>
          </View>
        );

      case 'colorful':
        return (
          <View style={[styles.templatePreview, { backgroundColor: '#fef2f2' }]}>
            <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.colorfulHeader}>
              <View style={styles.colorfulAvatar}>
                <Text style={styles.colorfulAvatarText}>👤</Text>
              </View>
              <Text style={styles.colorfulName}>张三</Text>
              <Text style={styles.colorfulRole}>前端工程师</Text>
            </LinearGradient>
            <View style={styles.colorfulBody}>
              <View style={styles.colorfulCard}>
                <Text style={styles.colorfulCardTitle}>工作经验</Text>
                <View style={[styles.previewLine, { backgroundColor: '#ccc', height: 2 }]} />
              </View>
            </View>
          </View>
        );

      case 'tech':
        return (
          <View style={[styles.templatePreview, { backgroundColor: '#0a0a0a', borderWidth: 2, borderColor: '#00ff88' }]}>
            <View style={styles.techHeader}>
              <View style={styles.techAvatar}>
                <Text style={styles.techAvatarText}>⚡</Text>
              </View>
              <Text style={styles.techName}>张三</Text>
              <Text style={styles.techRole}>前端工程师</Text>
            </View>
            <View style={styles.techBody}>
              <Text style={styles.techSectionTitle}>▶ 技能特长</Text>
              <View style={[styles.previewLine, { backgroundColor: '#00ff88', height: 2 }]} />
            </View>
          </View>
        );

      case 'magazine':
        return (
          <View style={[styles.templatePreview, { backgroundColor: '#fdf2f8' }]}>
            <LinearGradient colors={['#be185d', '#a21caf']} style={styles.magazineHeader}>
              <View style={styles.magazineAvatar}>
                <Text style={styles.magazineAvatarText}>👤</Text>
              </View>
              <Text style={styles.magazineName}>张三</Text>
              <Text style={styles.magazineRole}>前端工程师</Text>
            </LinearGradient>
            <View style={styles.magazineBody}>
              <Text style={styles.magazineTitle}>个人简介</Text>
              <View style={[styles.previewLine, { backgroundColor: '#be185d', height: 3, width: 50 }]} />
              <View style={[styles.previewLine, { backgroundColor: '#ccc', height: 2, marginTop: 8 }]} />
            </View>
          </View>
        );

      case 'infographic':
        return (
          <View style={[styles.templatePreview, { backgroundColor: '#fffbeb' }]}>
            <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.infoHeader}>
              <View style={styles.infoAvatar}>
                <Text style={styles.infoAvatarText}>👤</Text>
              </View>
              <View style={styles.infoDetails}>
                <Text style={styles.infoName}>张三</Text>
                <Text style={styles.infoRole}>前端工程师</Text>
              </View>
            </LinearGradient>
            <View style={styles.infoBody}>
              <View style={styles.infoStats}>
                <View style={styles.infoStatCard}>
                  <Text style={styles.infoStatNumber}>3+</Text>
                  <Text style={styles.infoStatLabel}>年经验</Text>
                </View>
                <View style={styles.infoStatCard}>
                  <Text style={styles.infoStatNumber}>10+</Text>
                  <Text style={styles.infoStatLabel}>项目</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'artistic':
        return (
          <LinearGradient colors={['#f3e8ff', '#e9d5ff']} style={styles.templatePreview}>
            <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.artisticHeader}>
              <View style={styles.artisticAvatar}>
                <Text style={styles.artisticAvatarText}>🎨</Text>
              </View>
              <Text style={styles.artisticName}>张三</Text>
              <Text style={styles.artisticRole}>前端工程师</Text>
            </LinearGradient>
            <View style={styles.artisticBody}>
              <View style={styles.artisticCard}>
                <Text style={styles.artisticTitle}>🎨 创意项目</Text>
                <View style={[styles.previewLine, { backgroundColor: '#8b5cf6', height: 2 }]} />
              </View>
            </View>
          </LinearGradient>
        );

      case 'minimal':
        return (
          <View style={[styles.templatePreview, { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb' }]}>
            <View style={styles.minimalHeader}>
              <View style={styles.minimalAvatar}>
                <Text style={styles.minimalAvatarText}>👤</Text>
              </View>
              <Text style={styles.minimalName}>张三</Text>
              <Text style={styles.minimalRole}>前端工程师</Text>
            </View>
            <View style={styles.minimalBody}>
              <Text style={styles.minimalTitle}>工作经验</Text>
              <View style={[styles.previewLine, { backgroundColor: '#1e293b', height: 1, width: 60 }]} />
              <View style={[styles.previewLine, { backgroundColor: '#ccc', height: 1, marginTop: 8 }]} />
            </View>
          </View>
        );

      case 'clean':
        return (
          <View style={[styles.templatePreview, { backgroundColor: '#f8fffe' }]}>
            <View style={styles.cleanHeader}>
              <Text style={styles.cleanName}>张三</Text>
              <Text style={styles.cleanRole}>前端工程师</Text>
              <View style={styles.cleanDivider} />
            </View>
            <View style={styles.cleanBody}>
              <View style={styles.cleanSection}>
                <Text style={styles.cleanSectionTitle}>个人简介</Text>
                <View style={[styles.previewLine, { backgroundColor: '#10b981', height: 2, width: 40 }]} />
                <View style={[styles.previewLine, { backgroundColor: '#d1d5db', height: 1, marginTop: 6 }]} />
                <View style={[styles.previewLine, { backgroundColor: '#d1d5db', height: 1, marginTop: 3, width: '80%' }]} />
              </View>
              <View style={styles.cleanSection}>
                <Text style={styles.cleanSectionTitle}>工作经验</Text>
                <View style={[styles.previewLine, { backgroundColor: '#10b981', height: 2, width: 40 }]} />
                <View style={[styles.previewLine, { backgroundColor: '#d1d5db', height: 1, marginTop: 6 }]} />
              </View>
            </View>
          </View>
        );

      case 'elegant':
        return (
          <View style={[styles.templatePreview, { backgroundColor: '#fefefe' }]}>
            <View style={styles.elegantHeader}>
              <View style={styles.elegantNameContainer}>
                <Text style={styles.elegantName}>张三</Text>
                <View style={styles.elegantUnderline} />
              </View>
              <Text style={styles.elegantRole}>前端工程师</Text>
              <View style={styles.elegantContact}>
                <Text style={styles.elegantContactText}>📧 zhang@email.com</Text>
                <Text style={styles.elegantContactText}>📱 138-0000-0000</Text>
              </View>
            </View>
            <View style={styles.elegantBody}>
              <View style={styles.elegantSection}>
                <View style={styles.elegantSectionHeader}>
                  <View style={styles.elegantDot} />
                  <Text style={styles.elegantSectionTitle}>专业技能</Text>
                </View>
                <View style={[styles.previewLine, { backgroundColor: '#e5e7eb', height: 1, marginTop: 4 }]} />
                <View style={[styles.previewLine, { backgroundColor: '#e5e7eb', height: 1, marginTop: 3, width: '70%' }]} />
              </View>
            </View>
          </View>
        );

      case 'pure':
        return (
          <View style={[styles.templatePreview, { backgroundColor: 'white' }]}>
            <View style={styles.pureHeader}>
              <Text style={styles.pureName}>张三</Text>
              <Text style={styles.pureRole}>前端工程师</Text>
            </View>
            <View style={styles.pureBody}>
              <View style={styles.pureSection}>
                <Text style={styles.pureSectionTitle}>ABOUT</Text>
                <View style={styles.pureSectionContent}>
                  <View style={[styles.previewLine, { backgroundColor: '#374151', height: 1 }]} />
                  <View style={[styles.previewLine, { backgroundColor: '#374151', height: 1, marginTop: 4, width: '85%' }]} />
                  <View style={[styles.previewLine, { backgroundColor: '#374151', height: 1, marginTop: 4, width: '60%' }]} />
                </View>
              </View>
              <View style={styles.pureSection}>
                <Text style={styles.pureSectionTitle}>EXPERIENCE</Text>
                <View style={styles.pureSectionContent}>
                  <View style={[styles.previewLine, { backgroundColor: '#374151', height: 1 }]} />
                  <View style={[styles.previewLine, { backgroundColor: '#374151', height: 1, marginTop: 4, width: '75%' }]} />
                </View>
              </View>
            </View>
          </View>
        );

      default:
        return (
          <View style={[styles.templatePreview, { backgroundColor: '#f3f4f6' }]}>
            <Text style={styles.defaultPreviewText}>模板预览</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 分类选择 */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={20} 
                color={selectedCategory === category.id ? 'white' : '#64748b'} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 模板网格 */}
      <ScrollView style={styles.templatesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.templatesGrid}>
          {filteredTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateCard}
              onPress={() => handleTemplateSelect(template)}
            >
              <View style={styles.templateImageContainer}>
                {renderTemplatePreview(template.preview)}
                
                {/* Pro标签 */}
                {template.isPro && (
                  <LinearGradient
                    colors={['#f59e0b', '#f97316']}
                    style={styles.proTag}
                  >
                    <Text style={styles.proTagText}>👑 PRO</Text>
                  </LinearGradient>
                )}

                {/* 悬浮操作按钮 */}
                <View style={styles.templateActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleTemplatePreview(template)}
                  >
                    <Ionicons name="eye-outline" size={16} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleTemplateSelect(template)}
                  >
                    <Ionicons name="create-outline" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateCategory}>
                  {categories.find(cat => cat.id === template.category)?.name || '其他'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pro升级卡片 */}
        <View style={styles.proPromotionContainer}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.proPromotionCard}
          >
            <View style={styles.proPromotionContent}>
              <Text style={styles.proPromotionTitle}>解锁所有Pro模板</Text>
              <Text style={styles.proPromotionDescription}>
                获得20+精美专业模板，让你的简历脱颖而出
              </Text>
              <TouchableOpacity 
                style={styles.proPromotionButton}
                onPress={() => navigation.navigate('ProUpgrade')}
              >
                <Text style={styles.proPromotionButtonText}>立即升级Pro</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.proPromotionIcon}>
              <Ionicons name="star" size={40} color="rgba(255, 255, 255, 0.3)" />
            </View>
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
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#6366f1',
  },
  categoryText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  templatesContainer: {
    flex: 1,
    padding: 20,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  templateCard: {
    width: cardWidth,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  templateImageContainer: {
    position: 'relative',
    height: cardWidth * 1.3,
  },
  templatePreview: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  previewLine: {
    height: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 1,
    marginBottom: 2,
  },
  defaultPreviewText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 20,
  },
  // Traditional 模板样式
  traditionalHeader: {
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  traditionalName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  traditionalTitle: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    marginTop: 2,
  },
  traditionalContact: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  traditionalContactText: {
    fontSize: 8,
    color: '#000',
  },
  traditionalBody: {
    padding: 8,
    flex: 1,
  },
  traditionalSection: {
    marginBottom: 8,
  },
  traditionalSectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  // Split 模板样式
  splitLeft: {
    width: '40%',
    padding: 8,
    alignItems: 'center',
  },
  splitAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  splitAvatarText: {
    fontSize: 10,
    color: 'white',
  },
  splitName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  splitRole: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 2,
  },
  splitRight: {
    flex: 1,
    padding: 8,
    backgroundColor: 'white',
  },
  splitMainTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  // Colorful 模板样式
  colorfulHeader: {
    padding: 8,
    alignItems: 'center',
    borderRadius: 8,
    margin: 4,
  },
  colorfulAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  colorfulAvatarText: {
    fontSize: 10,
    color: 'white',
  },
  colorfulName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  colorfulRole: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 2,
  },
  colorfulBody: {
    padding: 8,
    flex: 1,
  },
  colorfulCard: {
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 6,
    borderTopWidth: 2,
    borderTopColor: '#ef4444',
  },
  colorfulCardTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 4,
  },
  // Tech 模板样式
  techHeader: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(0,26,13,0.8)',
  },
  techAvatar: {
    width: 20,
    height: 20,
    backgroundColor: 'rgba(0,255,136,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  techAvatarText: {
    fontSize: 10,
    color: '#00ff88',
  },
  techName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00ff88',
    textAlign: 'center',
  },
  techRole: {
    fontSize: 8,
    color: '#66ffaa',
    textAlign: 'center',
    marginTop: 2,
  },
  techBody: {
    padding: 8,
    flex: 1,
    backgroundColor: 'rgba(0,26,13,0.6)',
  },
  techSectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 4,
  },
  // Magazine 模板样式
  magazineHeader: {
    padding: 8,
    alignItems: 'center',
  },
  magazineAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  magazineAvatarText: {
    fontSize: 10,
    color: 'white',
  },
  magazineName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  magazineRole: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
  magazineBody: {
    padding: 8,
    flex: 1,
    backgroundColor: 'white',
  },
  magazineTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#be185d',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  // Infographic 模板样式
  infoHeader: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoAvatar: {
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  infoAvatarText: {
    fontSize: 10,
    color: 'white',
  },
  infoDetails: {
    flex: 1,
  },
  infoName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  infoRole: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  infoBody: {
    padding: 8,
    flex: 1,
  },
  infoStats: {
    flexDirection: 'row',
    gap: 6,
  },
  infoStatCard: {
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 4,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#f59e0b',
    flex: 1,
  },
  infoStatNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  infoStatLabel: {
    fontSize: 6,
    color: '#6b7280',
  },
  // Artistic 模板样式
  artisticHeader: {
    padding: 8,
    alignItems: 'center',
    margin: 4,
    borderRadius: 8,
  },
  artisticAvatar: {
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  artisticAvatarText: {
    fontSize: 10,
    color: 'white',
  },
  artisticName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  artisticRole: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
  artisticBody: {
    padding: 8,
    flex: 1,
  },
  artisticCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 6,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#8b5cf6',
  },
  artisticTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  // Minimal 模板样式
  minimalHeader: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  minimalAvatar: {
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  minimalAvatarText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  minimalName: {
    fontSize: 12,
    fontWeight: '300',
    color: 'white',
    textAlign: 'center',
  },
  minimalRole: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '300',
  },
  minimalBody: {
    padding: 8,
    flex: 1,
    backgroundColor: 'white',
  },
  minimalTitle: {
    fontSize: 10,
    fontWeight: '300',
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: 1,
  },
  // Clean 模板样式
  cleanHeader: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cleanName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cleanRole: {
    fontSize: 10,
    color: '#10b981',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  cleanDivider: {
    width: 30,
    height: 2,
    backgroundColor: '#10b981',
    marginTop: 6,
  },
  cleanBody: {
    padding: 12,
    flex: 1,
  },
  cleanSection: {
    marginBottom: 12,
  },
  cleanSectionTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  // Elegant 模板样式
  elegantHeader: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  elegantNameContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  elegantName: {
    fontSize: 16,
    fontWeight: '300',
    color: '#1f2937',
    textAlign: 'center',
    letterSpacing: 2,
  },
  elegantUnderline: {
    width: 40,
    height: 1,
    backgroundColor: '#6b7280',
    marginTop: 4,
  },
  elegantRole: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 1,
  },
  elegantContact: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  elegantContactText: {
    fontSize: 7,
    color: '#9ca3af',
    fontWeight: '300',
  },
  elegantBody: {
    padding: 12,
    flex: 1,
  },
  elegantSection: {
    marginBottom: 12,
  },
  elegantSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  elegantDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6b7280',
    marginRight: 8,
  },
  elegantSectionTitle: {
    fontSize: 9,
    fontWeight: '400',
    color: '#374151',
    letterSpacing: 1,
  },
  // Pure 模板样式
  pureHeader: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  pureName: {
    fontSize: 18,
    fontWeight: '200',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: 3,
  },
  pureRole: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '300',
    letterSpacing: 2,
  },
  pureBody: {
    padding: 16,
    flex: 1,
  },
  pureSection: {
    marginBottom: 16,
  },
  pureSectionTitle: {
    fontSize: 8,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 2,
    marginBottom: 8,
  },
  pureSectionContent: {
    paddingLeft: 8,
  },
  proTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proTagText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  templateActions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateInfo: {
    padding: 12,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  templateCategory: {
    fontSize: 12,
    color: '#64748b',
  },
  proPromotionContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  proPromotionCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  proPromotionContent: {
    flex: 1,
  },
  proPromotionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  proPromotionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 20,
  },
  proPromotionButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  proPromotionButtonText: {
    color: '#6366f1',
    fontWeight: '600',
    fontSize: 14,
  },
  proPromotionIcon: {
    marginLeft: 20,
  },
});