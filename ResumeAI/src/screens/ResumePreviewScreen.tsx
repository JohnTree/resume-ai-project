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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type ResumePreviewNavigationProp = StackNavigationProp<RootStackParamList, 'ResumePreview'>;
type ResumePreviewRouteProp = RouteProp<RootStackParamList, 'ResumePreview'>;

interface Props {
  navigation: ResumePreviewNavigationProp;
  route: ResumePreviewRouteProp;
}

export default function ResumePreviewScreen({ navigation, route }: Props) {
  const { resumeId, resumeData, templateId } = route.params;

  // 使用传入的简历数据，如果没有则使用默认数据
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

  const currentData = resumeData || defaultData;

  const handleExportPDF = () => {
    Alert.alert('导出PDF', '简历PDF已生成并保存到相册');
  };

  const handleShare = () => {
    Alert.alert('分享简历', '选择分享方式', [
      { text: '微信', onPress: () => {} },
      { text: '邮件', onPress: () => {} },
      { text: '取消', style: 'cancel' },
    ]);
  };

  // 根据模板ID获取样式
  const getTemplateStyles = (templateId: string) => {
    const templateStyles = {
      'traditional': styles.classicTemplate,
      'split': styles.modernTemplate,
      'colorful': styles.colorfulTemplate,
      'tech': styles.techTemplate,
      'magazine': styles.elegantTemplate,
      'infographic': styles.infographicTemplate,
      'artistic': styles.creativeTemplate,
      'minimal': styles.businessTemplate,
      'clean': styles.cleanTemplate,
      'elegant': styles.elegantSimpleTemplate,
      'pure': styles.pureTemplate,
    };
    return templateStyles[templateId as keyof typeof templateStyles] || styles.classicTemplate;
  };

  // 根据模板ID渲染不同的内容布局
  const renderTemplateContent = (templateId: string, data: any) => {
    switch (templateId) {
      case 'split':
        return renderModernTemplate(data);
      case 'colorful':
        return renderColorfulTemplate(data);
      case 'tech':
        return renderTechTemplate(data);
      case 'magazine':
        return renderElegantTemplate(data);
      case 'infographic':
        return renderInfographicTemplate(data);
      case 'artistic':
        return renderCreativeTemplate(data);
      case 'minimal':
        return renderBusinessTemplate(data);
      case 'clean':
        return renderCleanTemplate(data);
      case 'elegant':
        return renderElegantSimpleTemplate(data);
      case 'pure':
        return renderPureTemplate(data);
      default:
        return renderClassicTemplate(data);
    }
  };

  // 经典模板
  const renderClassicTemplate = (data: any) => (
    <>
      <View style={styles.classicHeader}>
        <Text style={styles.classicName}>{data.personalInfo.name || '姓名'}</Text>
        <View style={styles.classicContact}>
          {data.personalInfo.email && <Text style={styles.classicContactText}>📧 {data.personalInfo.email}</Text>}
          {data.personalInfo.phone && <Text style={styles.classicContactText}>📱 {data.personalInfo.phone}</Text>}
          {data.personalInfo.address && <Text style={styles.classicContactText}>📍 {data.personalInfo.address}</Text>}
        </View>
      </View>
      {renderCommonSections(data, 'classic')}
    </>
  );

  // 现代双栏模板
  const renderModernTemplate = (data: any) => (
    <View style={styles.modernLayout}>
      <View style={styles.modernSidebar}>
        <Text style={styles.modernName}>{data.personalInfo.name || '姓名'}</Text>
        <View style={styles.modernContact}>
          {data.personalInfo.email && <Text style={styles.modernContactText}>📧 {data.personalInfo.email}</Text>}
          {data.personalInfo.phone && <Text style={styles.modernContactText}>📱 {data.personalInfo.phone}</Text>}
          {data.personalInfo.address && <Text style={styles.modernContactText}>📍 {data.personalInfo.address}</Text>}
        </View>
        {data.skills && data.skills.length > 0 && (
          <View style={styles.modernSkillsSection}>
            <Text style={styles.modernSectionTitle}>技能特长</Text>
            {data.skills.map((skill: string, index: number) => (
              <Text key={index} style={styles.modernSkillItem}>• {skill}</Text>
            ))}
          </View>
        )}
      </View>
      <View style={styles.modernContent}>
        {renderCommonSections(data, 'modern')}
      </View>
    </View>
  );

  // 彩色卡片模板
  const renderColorfulTemplate = (data: any) => (
    <>
      <LinearGradient
        colors={['#ff6b6b', '#ee5a24']}
        style={styles.colorfulHeader}
      >
        <Text style={styles.colorfulName}>{data.personalInfo.name || '姓名'}</Text>
        <View style={styles.colorfulContact}>
          {data.personalInfo.email && <Text style={styles.colorfulContactText}>📧 {data.personalInfo.email}</Text>}
          {data.personalInfo.phone && <Text style={styles.colorfulContactText}>📱 {data.personalInfo.phone}</Text>}
          {data.personalInfo.address && <Text style={styles.colorfulContactText}>📍 {data.personalInfo.address}</Text>}
        </View>
      </LinearGradient>
      {renderCommonSections(data, 'colorful')}
    </>
  );

  // 科技未来模板
  const renderTechTemplate = (data: any) => (
    <>
      <View style={styles.techHeader}>
        <Text style={styles.techName}>{data.personalInfo.name || '姓名'}</Text>
        <View style={styles.techContact}>
          {data.personalInfo.email && <Text style={styles.techContactText}>📧 {data.personalInfo.email}</Text>}
          {data.personalInfo.phone && <Text style={styles.techContactText}>📱 {data.personalInfo.phone}</Text>}
          {data.personalInfo.address && <Text style={styles.techContactText}>📍 {data.personalInfo.address}</Text>}
        </View>
      </View>
      {renderCommonSections(data, 'tech')}
    </>
  );

  // 优雅杂志模板
  const renderElegantTemplate = (data: any) => (
    <>
      <LinearGradient
        colors={['#ff9ff3', '#f368e0']}
        style={styles.elegantHeader}
      >
        <Text style={styles.elegantName}>{data.personalInfo.name || '姓名'}</Text>
        <View style={styles.elegantContact}>
          {data.personalInfo.email && <Text style={styles.elegantContactText}>📧 {data.personalInfo.email}</Text>}
          {data.personalInfo.phone && <Text style={styles.elegantContactText}>📱 {data.personalInfo.phone}</Text>}
          {data.personalInfo.address && <Text style={styles.elegantContactText}>📍 {data.personalInfo.address}</Text>}
        </View>
      </LinearGradient>
      {renderCommonSections(data, 'elegant')}
    </>
  );

  // 信息图表模板
  const renderInfographicTemplate = (data: any) => (
    <>
      <View style={styles.infographicHeader}>
        <Text style={styles.infographicName}>{data.personalInfo.name || '姓名'}</Text>
        <View style={styles.infographicContact}>
          {data.personalInfo.email && <Text style={styles.infographicContactText}>📧 {data.personalInfo.email}</Text>}
          {data.personalInfo.phone && <Text style={styles.infographicContactText}>📱 {data.personalInfo.phone}</Text>}
          {data.personalInfo.address && <Text style={styles.infographicContactText}>📍 {data.personalInfo.address}</Text>}
        </View>
      </View>
      {renderCommonSections(data, 'infographic')}
    </>
  );

  // 创意艺术模板
  const renderCreativeTemplate = (data: any) => (
    <>
      <LinearGradient
        colors={['#a29bfe', '#6c5ce7']}
        style={styles.creativeHeader}
      >
        <Text style={styles.creativeName}>{data.personalInfo.name || '姓名'}</Text>
        <View style={styles.creativeContact}>
          {data.personalInfo.email && <Text style={styles.creativeContactText}>📧 {data.personalInfo.email}</Text>}
          {data.personalInfo.phone && <Text style={styles.creativeContactText}>📱 {data.personalInfo.phone}</Text>}
          {data.personalInfo.address && <Text style={styles.creativeContactText}>📍 {data.personalInfo.address}</Text>}
        </View>
      </LinearGradient>
      {renderCommonSections(data, 'creative')}
    </>
  );

  // 商务简约模板
  const renderBusinessTemplate = (data: any) => (
    <>
      <View style={styles.businessHeader}>
        <Text style={styles.businessName}>{data.personalInfo.name || '姓名'}</Text>
        <View style={styles.businessContact}>
          {data.personalInfo.email && <Text style={styles.businessContactText}>📧 {data.personalInfo.email}</Text>}
          {data.personalInfo.phone && <Text style={styles.businessContactText}>📱 {data.personalInfo.phone}</Text>}
          {data.personalInfo.address && <Text style={styles.businessContactText}>📍 {data.personalInfo.address}</Text>}
        </View>
      </View>
      {renderCommonSections(data, 'business')}
    </>
  );

  // 清新简约模板
  const renderCleanTemplate = (data: any) => (
    <>
      <View style={styles.cleanHeader}>
        <Text style={styles.cleanName}>{data.personalInfo.name || '姓名'}</Text>
        <Text style={styles.cleanRole}>前端工程师</Text>
        <View style={styles.cleanDivider} />
        <View style={styles.cleanContact}>
          {data.personalInfo.email && <Text style={styles.cleanContactText}>📧 {data.personalInfo.email}</Text>}
          {data.personalInfo.phone && <Text style={styles.cleanContactText}>📱 {data.personalInfo.phone}</Text>}
          {data.personalInfo.address && <Text style={styles.cleanContactText}>📍 {data.personalInfo.address}</Text>}
        </View>
      </View>
      {renderCommonSections(data, 'clean')}
    </>
  );

  // 优雅简约模板
  const renderElegantSimpleTemplate = (data: any) => (
    <>
      <View style={styles.elegantSimpleHeader}>
        <View style={styles.elegantSimpleNameContainer}>
          <Text style={styles.elegantSimpleName}>{data.personalInfo.name || '姓名'}</Text>
          <View style={styles.elegantSimpleUnderline} />
        </View>
        <Text style={styles.elegantSimpleRole}>前端工程师</Text>
        <View style={styles.elegantSimpleContact}>
          {data.personalInfo.email && <Text style={styles.elegantSimpleContactText}>📧 {data.personalInfo.email}</Text>}
          {data.personalInfo.phone && <Text style={styles.elegantSimpleContactText}>📱 {data.personalInfo.phone}</Text>}
          {data.personalInfo.address && <Text style={styles.elegantSimpleContactText}>📍 {data.personalInfo.address}</Text>}
        </View>
      </View>
      {renderCommonSections(data, 'elegantSimple')}
    </>
  );

  // 纯净简约模板
  const renderPureTemplate = (data: any) => (
    <>
      <View style={styles.pureHeader}>
        <Text style={styles.pureName}>{data.personalInfo.name || '姓名'}</Text>
        <Text style={styles.pureRole}>前端工程师</Text>
        <View style={styles.pureContact}>
          {data.personalInfo.email && <Text style={styles.pureContactText}>{data.personalInfo.email}</Text>}
          {data.personalInfo.phone && <Text style={styles.pureContactText}>{data.personalInfo.phone}</Text>}
          {data.personalInfo.address && <Text style={styles.pureContactText}>{data.personalInfo.address}</Text>}
        </View>
      </View>
      {renderCommonSections(data, 'pure')}
    </>
  );

  // 通用内容区域
  const renderCommonSections = (data: any, templateType: string) => (
    <>
      {/* 个人简介 */}
      {data.personalInfo.summary && (
        <View style={styles.resumeSection}>
          <Text style={[styles.sectionTitle, getSectionTitleStyle(templateType)]}>个人简介</Text>
          <Text style={styles.sectionContent}>{data.personalInfo.summary}</Text>
        </View>
      )}

      {/* 工作经验 */}
      {data.experience && data.experience.length > 0 && (
        <View style={styles.resumeSection}>
          <Text style={[styles.sectionTitle, getSectionTitleStyle(templateType)]}>工作经验</Text>
          {data.experience.map((exp: any, index: number) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <Text style={styles.companyName}>{exp.company}</Text>
                <Text style={styles.dateRange}>{exp.startDate} - {exp.endDate}</Text>
              </View>
              <Text style={styles.position}>{exp.position}</Text>
              {exp.description && <Text style={styles.experienceDescription}>{exp.description}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* 教育背景 */}
      {data.education && data.education.length > 0 && (
        <View style={styles.resumeSection}>
          <Text style={[styles.sectionTitle, getSectionTitleStyle(templateType)]}>教育背景</Text>
          {data.education.map((edu: any, index: number) => (
            <View key={index} style={styles.educationItem}>
              <View style={styles.educationHeader}>
                <Text style={styles.schoolName}>{edu.school}</Text>
                <Text style={styles.dateRange}>{edu.startDate} - {edu.endDate}</Text>
              </View>
              <Text style={styles.degree}>{edu.degree}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 技能特长 (非双栏模板显示) */}
      {templateType !== 'split' && data.skills && data.skills.length > 0 && (
        <View style={styles.resumeSection}>
          <Text style={[styles.sectionTitle, getSectionTitleStyle(templateType)]}>技能特长</Text>
          <View style={styles.skillsContainer}>
            {data.skills.map((skill: string, index: number) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );

  // 获取不同模板的标题样式
  const getSectionTitleStyle = (templateType: string) => {
    const titleStyles = {
      traditional: { color: '#1e293b' },
      split: { color: '#3b82f6' },
      colorful: { color: '#ff6b6b' },
      tech: { color: '#00ff88' },
      magazine: { color: '#f368e0' },
      infographic: { color: '#ffa502' },
      creative: { color: '#6c5ce7' },
      business: { color: '#2d3748' },
    };
    return titleStyles[templateType as keyof typeof titleStyles] || titleStyles.traditional;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 工具栏 */}
      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={styles.toolbarButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="create-outline" size={20} color="#6366f1" />
          <Text style={styles.toolbarButtonText}>编辑</Text>
        </TouchableOpacity>
        
        <View style={styles.toolbarActions}>
          <TouchableOpacity style={styles.toolbarButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#6366f1" />
            <Text style={styles.toolbarButtonText}>分享</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolbarButton} onPress={handleExportPDF}>
            <Ionicons name="download-outline" size={20} color="#6366f1" />
            <Text style={styles.toolbarButtonText}>导出</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 简历预览 */}
      <ScrollView style={styles.previewContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.resumePreview, getTemplateStyles(templateId)]}>
          {renderTemplateContent(templateId, currentData)}
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
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolbarButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 20,
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  resumePreview: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // 模板基础样式
  classicTemplate: {
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  modernTemplate: {
    borderLeftWidth: 5,
    borderLeftColor: '#3b82f6',
  },
  colorfulTemplate: {},
  techTemplate: {
    backgroundColor: '#0f172a',
  },
  elegantTemplate: {},
  infographicTemplate: {},
  creativeTemplate: {},
  businessTemplate: {
    borderTopWidth: 4,
    borderTopColor: '#2d3748',
  },

  // 经典模板样式
  classicHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1e293b',
  },
  classicName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  classicContact: {
    gap: 8,
  },
  classicContactText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },

  // 现代双栏模板样式
  modernLayout: {
    flexDirection: 'row',
    gap: 20,
  },
  modernSidebar: {
    width: '35%',
    backgroundColor: '#3b82f6',
    padding: 20,
    borderRadius: 8,
  },
  modernContent: {
    flex: 1,
  },
  modernName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  modernContact: {
    gap: 8,
    marginBottom: 20,
  },
  modernContactText: {
    fontSize: 12,
    color: 'white',
  },
  modernSkillsSection: {
    marginTop: 20,
  },
  modernSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  modernSkillItem: {
    fontSize: 12,
    color: 'white',
    marginBottom: 4,
  },

  // 彩色卡片模板样式
  colorfulHeader: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  colorfulName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  colorfulContact: {
    gap: 8,
  },
  colorfulContactText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },

  // 科技未来模板样式
  techHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#00ff88',
  },
  techName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 16,
  },
  techContact: {
    gap: 8,
  },
  techContactText: {
    fontSize: 14,
    color: '#00ff88',
    textAlign: 'center',
  },

  // 优雅杂志模板样式
  elegantHeader: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  elegantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  elegantContact: {
    gap: 8,
  },
  elegantContactText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },

  // 信息图表模板样式
  infographicHeader: {
    backgroundColor: '#ffa502',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  infographicName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  infographicContact: {
    gap: 8,
  },
  infographicContactText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },

  // 创意艺术模板样式
  creativeHeader: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  creativeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  creativeContact: {
    gap: 8,
  },
  creativeContactText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },

  // 商务简约模板样式
  businessHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  businessName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
  },
  businessContact: {
    gap: 8,
  },
  businessContactText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },

  // 通用样式
  resumeSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  experienceItem: {
    marginBottom: 20,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  dateRange: {
    fontSize: 14,
    color: '#64748b',
  },
  position: {
    fontSize: 14,
    color: '#6366f1',
    marginBottom: 8,
  },
  experienceDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  educationItem: {
    marginBottom: 15,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  degree: {
    fontSize: 14,
    color: '#6366f1',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  skillText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },

  // 清新简约模板样式
  cleanTemplate: {
    backgroundColor: '#f8fffe',
  },
  cleanHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cleanName: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  cleanRole: {
    fontSize: 16,
    color: '#10b981',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 12,
  },
  cleanDivider: {
    width: 60,
    height: 3,
    backgroundColor: '#10b981',
    marginBottom: 16,
  },
  cleanContact: {
    gap: 8,
  },
  cleanContactText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },

  // 优雅简约模板样式
  elegantSimpleTemplate: {
    backgroundColor: '#fefefe',
  },
  elegantSimpleHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
  },
  elegantSimpleNameContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  elegantSimpleName: {
    fontSize: 30,
    fontWeight: '300',
    color: '#1f2937',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 8,
  },
  elegantSimpleUnderline: {
    width: 80,
    height: 1,
    backgroundColor: '#6b7280',
  },
  elegantSimpleRole: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 1,
    marginBottom: 16,
  },
  elegantSimpleContact: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  elegantSimpleContactText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '300',
  },

  // 纯净简约模板样式
  pureTemplate: {
    backgroundColor: 'white',
  },
  pureHeader: {
    alignItems: 'center',
    marginBottom: 40,
    paddingBottom: 30,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  pureName: {
    fontSize: 36,
    fontWeight: '200',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 12,
  },
  pureRole: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 3,
    marginBottom: 20,
  },
  pureContact: {
    alignItems: 'center',
    gap: 8,
  },
  pureContactText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '300',
    letterSpacing: 1,
  },
});