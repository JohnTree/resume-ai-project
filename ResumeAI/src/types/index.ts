// 用户类型
export interface User {
  id: string;
  username: string;
  email?: string;
  isPro: boolean;
}

// 个人信息类型
export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
}

// 工作经验类型
export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

// 教育背景类型
export interface Education {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

// 简历数据类型
export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

// 简历模板类型
export interface Template {
  id: string;
  name: string;
  preview: string;
  isPro: boolean;
  category: string;
}

// 简历类型
export interface Resume {
  id: string;
  title: string;
  template: string;
  data: ResumeData;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// 导航参数类型
export type RootStackParamList = {
  Home: undefined;
  TemplateSelection: undefined;
  ResumeEditor: { templateId: string; resumeId?: string };
  ResumePreview: { resumeId: string; resumeData?: ResumeData; templateId: string };
  ResumeList: undefined;
  Login: undefined;
  Profile: undefined;
  ProUpgrade: undefined;
};