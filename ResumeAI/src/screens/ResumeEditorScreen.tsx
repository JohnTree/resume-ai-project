import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, ResumeData } from '../types';
import { useAI } from '../hooks/useAI';

type ResumeEditorNavigationProp = StackNavigationProp<RootStackParamList, 'ResumeEditor'>;
type ResumeEditorRouteProp = RouteProp<RootStackParamList, 'ResumeEditor'>;

interface Props {
  navigation: ResumeEditorNavigationProp;
  route: ResumeEditorRouteProp;
}

export default function ResumeEditorScreen({ navigation, route }: Props) {
  const { templateId, resumeId } = route.params;
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: [],
  });

  const [activeSection, setActiveSection] = useState('personal');
  const [aiSuggestions, setAiSuggestions] = useState<{
    summary?: string[];
    skills?: string[];
    experience?: { [key: number]: string[] };
  }>({});
  
  // 使用AI Hook
  const { isOptimizing, optimizeContent: aiOptimizeContent, validateContent, getQuickSuggestions } = useAI();

  const sections = [
    { id: 'personal', name: '个人信息', icon: 'person-outline' },
    { id: 'experience', name: '工作经验', icon: 'briefcase-outline' },
    { id: 'education', name: '教育背景', icon: 'school-outline' },
    { id: 'skills', name: '技能特长', icon: 'code-slash-outline' },
  ];

  const handleSave = () => {
    Alert.alert('保存成功', '简历已保存到草稿箱', [
      {
        text: '继续编辑',
        style: 'cancel',
      },
      {
        text: '预览简历',
        onPress: () => navigation.navigate('ResumePreview', { 
          resumeId: 'temp-id',
          resumeData: resumeData,
          templateId: templateId
        }),
      },
    ]);
  };

  const handlePreview = () => {
    navigation.navigate('ResumePreview', { 
      resumeId: 'temp-id',
      resumeData: resumeData,
      templateId: templateId
    });
  };

  // AI优化内容
  const optimizeContent = async (type: 'summary' | 'skills') => {
    let content = '';
    if (type === 'summary') {
      content = resumeData.personalInfo.summary;
    } else if (type === 'skills') {
      content = resumeData.skills.join(', ');
    }
    
    if (!content.trim()) {
      Alert.alert('提示', '请先输入内容再进行AI优化');
      return;
    }
    
    const result = await aiOptimizeContent(content, type);
    if (result) {
      if (type === 'summary') {
        setResumeData(prev => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, summary: result.optimizedContent }
        }));
      } else if (type === 'skills') {
        const skillsArray = result.optimizedContent.split(',').map((s: string) => s.trim());
        setResumeData(prev => ({
          ...prev,
          skills: skillsArray
        }));
      }
      
      setAiSuggestions(prev => ({
        ...prev,
        [type]: result.suggestions
      }));
      
      Alert.alert('AI优化完成', `评分：${result.score}/100`);
    }
  };



  // 添加工作经验
  const addExperience = () => {
    const newExperience = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  // 删除工作经验
  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  // 更新工作经验
  const updateExperience = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  // AI优化工作经验
  const optimizeExperience = async (index: number) => {
    const experience = resumeData.experience[index];
    const content = experience.description;
    
    if (!content.trim()) {
      Alert.alert('提示', '请先输入工作描述再进行AI优化');
      return;
    }
    
    const result = await aiOptimizeContent(content, 'experience');
    if (result) {
      updateExperience(index, 'description', result.optimizedContent);
      
      setAiSuggestions(prev => ({
        ...prev,
        experience: {
          ...prev.experience,
          [index]: result.suggestions
        }
      }));
      
      Alert.alert('AI优化完成', `评分：${result.score}/100`);
    }
  };

  // 添加教育背景
  const addEducation = () => {
    const newEducation = {
      school: '',
      degree: '',
      startDate: '',
      endDate: '',
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  // 删除教育背景
  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // 更新教育背景
  const updateEducation = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const renderPersonalInfo = () => (
    <View style={styles.sectionContent}>
      <Text style={styles.sectionTitle}>个人信息</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>姓名 *</Text>
        <TextInput
          style={styles.input}
          placeholder="请输入您的姓名"
          value={resumeData.personalInfo.name}
          onChangeText={(text) => 
            setResumeData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, name: text }
            }))
          }
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>邮箱 *</Text>
        <TextInput
          style={styles.input}
          placeholder="your.email@example.com"
          value={resumeData.personalInfo.email}
          onChangeText={(text) => 
            setResumeData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, email: text }
            }))
          }
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>电话 *</Text>
        <TextInput
          style={styles.input}
          placeholder="请输入手机号码"
          value={resumeData.personalInfo.phone}
          onChangeText={(text) => 
            setResumeData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, phone: text }
            }))
          }
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>地址</Text>
        <TextInput
          style={styles.input}
          placeholder="请输入您的地址"
          value={resumeData.personalInfo.address}
          onChangeText={(text) => 
            setResumeData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, address: text }
            }))
          }
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>个人简介</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="简要介绍您的专业背景和职业目标..."
          value={resumeData.personalInfo.summary}
          onChangeText={(text) => 
            setResumeData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, summary: text }
            }))
          }
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity 
          style={[styles.aiButton, isOptimizing && styles.aiButtonDisabled]} 
          onPress={() => optimizeContent('summary')}
          disabled={isOptimizing}
        >
          <Ionicons name="sparkles-outline" size={16} color="white" />
          <Text style={styles.aiButtonText}>
            {isOptimizing ? 'AI优化中...' : 'AI智能优化'}
          </Text>
        </TouchableOpacity>
        {aiSuggestions.summary && (
          <View style={styles.aiSuggestions}>
            <Text style={styles.aiSuggestionsTitle}>✨ AI优化建议：</Text>
            {aiSuggestions.summary.map((suggestion, index) => (
              <Text key={index} style={styles.aiSuggestionItem}>• {suggestion}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderExperience = () => (
    <View style={styles.sectionContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>工作经验</Text>
        <TouchableOpacity style={styles.addButton} onPress={addExperience}>
          <Ionicons name="add-circle-outline" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>
      
      {resumeData.experience.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="briefcase-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyStateText}>暂无工作经验</Text>
          <Text style={styles.emptyStateSubtext}>点击右上角 + 号添加工作经验</Text>
        </View>
      ) : (
        <View>
          {resumeData.experience.map((exp, index) => (
            <View key={index} style={styles.experienceCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>工作经验 {index + 1}</Text>
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => removeExperience(index)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>公司名称 *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="请输入公司名称"
                    value={exp.company}
                    onChangeText={(text) => updateExperience(index, 'company', text)}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>职位 *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="请输入职位"
                    value={exp.position}
                    onChangeText={(text) => updateExperience(index, 'position', text)}
                  />
                </View>
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>开始时间</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2021.03"
                    value={exp.startDate}
                    onChangeText={(text) => updateExperience(index, 'startDate', text)}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>结束时间</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="至今"
                    value={exp.endDate}
                    onChangeText={(text) => updateExperience(index, 'endDate', text)}
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>工作描述</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="描述您的主要职责和成就..."
                  value={exp.description}
                  onChangeText={(text) => updateExperience(index, 'description', text)}
                  multiline
                  numberOfLines={4}
                />
                <TouchableOpacity 
                  style={[styles.aiButton, isOptimizing && styles.aiButtonDisabled]} 
                  onPress={() => optimizeExperience(index)}
                  disabled={isOptimizing}
                >
                  <Ionicons name="sparkles-outline" size={16} color="white" />
                  <Text style={styles.aiButtonText}>
                    {isOptimizing ? 'AI优化中...' : 'AI优化'}
                  </Text>
                </TouchableOpacity>
                {aiSuggestions.experience?.[index] && (
                  <View style={styles.aiSuggestions}>
                    <Text style={styles.aiSuggestionsTitle}>✨ AI优化建议：</Text>
                    {aiSuggestions.experience[index].map((suggestion, suggestionIndex) => (
                      <Text key={suggestionIndex} style={styles.aiSuggestionItem}>• {suggestion}</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderEducation = () => (
    <View style={styles.sectionContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>教育背景</Text>
        <TouchableOpacity style={styles.addButton} onPress={addEducation}>
          <Ionicons name="add-circle-outline" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>
      
      {resumeData.education.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="school-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyStateText}>暂无教育背景</Text>
          <Text style={styles.emptyStateSubtext}>点击右上角 + 号添加教育背景</Text>
        </View>
      ) : (
        <View>
          {resumeData.education.map((edu, index) => (
            <View key={index} style={styles.experienceCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>教育背景 {index + 1}</Text>
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => removeEducation(index)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>学校名称 *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="请输入学校名称"
                    value={edu.school}
                    onChangeText={(text) => updateEducation(index, 'school', text)}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>专业 *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="请输入专业"
                    value={edu.degree}
                    onChangeText={(text) => updateEducation(index, 'degree', text)}
                  />
                </View>
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>开始时间</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2017.09"
                    value={edu.startDate}
                    onChangeText={(text) => updateEducation(index, 'startDate', text)}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>结束时间</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2021.06"
                    value={edu.endDate}
                    onChangeText={(text) => updateEducation(index, 'endDate', text)}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderSkills = () => (
    <View style={styles.sectionContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>技能特长</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>技能列表</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="JavaScript, React, Node.js, Python, 项目管理, 团队协作..."
          value={resumeData.skills.join(', ')}
          onChangeText={(text) => {
            const skillsArray = text.split(',').map(s => s.trim()).filter(s => s);
            setResumeData(prev => ({
              ...prev,
              skills: skillsArray
            }));
          }}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity 
          style={[styles.aiButton, isOptimizing && styles.aiButtonDisabled]} 
          onPress={() => optimizeContent('skills')}
          disabled={isOptimizing}
        >
          <Ionicons name="sparkles-outline" size={16} color="white" />
          <Text style={styles.aiButtonText}>
            {isOptimizing ? 'AI优化中...' : 'AI优化技能'}
          </Text>
        </TouchableOpacity>
        {aiSuggestions.skills && (
          <View style={styles.aiSuggestions}>
            <Text style={styles.aiSuggestionsTitle}>✨ AI优化建议：</Text>
            {aiSuggestions.skills.map((suggestion, index) => (
              <Text key={index} style={styles.aiSuggestionItem}>• {suggestion}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalInfo();
      case 'experience':
        return renderExperience();
      case 'education':
        return renderEducation();
      case 'skills':
        return renderSkills();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部工具栏 */}
      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={styles.toolbarButton}
          onPress={handlePreview}
        >
          <Ionicons name="eye-outline" size={20} color="#6366f1" />
          <Text style={styles.toolbarButtonText}>预览</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.toolbarButton} onPress={handleSave}>
          <Ionicons name="save-outline" size={20} color="#6366f1" />
          <Text style={styles.toolbarButtonText}>保存</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* 左侧导航 */}
        <View style={styles.sidebar}>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.sidebarItem,
                activeSection === section.id && styles.sidebarItemActive
              ]}
              onPress={() => setActiveSection(section.id)}
            >
              <Ionicons 
                name={section.icon as any} 
                size={20} 
                color={activeSection === section.id ? '#6366f1' : '#64748b'} 
              />
              <Text style={[
                styles.sidebarText,
                activeSection === section.id && styles.sidebarTextActive
              ]}>
                {section.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 右侧内容区 */}
        <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>
      </View>
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 15,
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
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 120,
    backgroundColor: 'white',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    paddingVertical: 20,
  },
  sidebarItem: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 6,
  },
  sidebarItemActive: {
    backgroundColor: '#f1f5f9',
    borderRightWidth: 3,
    borderRightColor: '#6366f1',
  },
  sidebarText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  sidebarTextActive: {
    color: '#6366f1',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  aiButtonDisabled: {
    backgroundColor: '#a1a1aa',
  },
  aiButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  aiSuggestions: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  aiSuggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  aiSuggestionItem: {
    fontSize: 13,
    color: '#0369a1',
    marginBottom: 4,
    lineHeight: 18,
  },
  experienceCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  deleteButton: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
});