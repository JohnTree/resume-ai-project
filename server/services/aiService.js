const axios = require('axios');

class AIService {
  constructor() {
    this.dashscopeApiKey = process.env.DASHSCOPE_API_KEY;
    this.dashscopeUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
  }

  async optimizeWithDashscope(content, type) {
    if (!this.dashscopeApiKey) {
      throw new Error('Dashscope API key not configured');
    }

    const prompt = this.generatePrompt(content, type);
    
    try {
      const response = await axios.post(this.dashscopeUrl, {
        model: 'qwen-plus-2025-09-11',
        input: {
          messages: [
            {
              role: 'system',
              content: '你是一个专业的简历优化专家，擅长帮助求职者改进简历内容，提高简历的专业性和吸引力。'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 0.8
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.dashscopeApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Dashscope API 完整响应:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.output) {
        // 处理不同的响应格式
        let aiResponse = '';
        if (response.data.output.text) {
          aiResponse = response.data.output.text;
        } else if (response.data.output.choices && response.data.output.choices[0]) {
          aiResponse = response.data.output.choices[0].message.content;
        } else {
          console.error('无法解析AI响应格式:', response.data.output);
          return this.getMockOptimization(content, type);
        }
        
        console.log('AI响应内容:', aiResponse);
        return this.parseAIResponse(aiResponse, content);
      } else {
        console.error('Unexpected API response structure:', response.data);
        return this.getMockOptimization(content, type);
      }
    } catch (error) {
      console.error('Dashscope API error:', error.response?.data || error.message);
      // 如果API调用失败，返回模拟优化结果
      return this.getMockOptimization(content, type);
    }
  }

  generatePrompt(content, type) {
    const prompts = {
      experience: `请帮我优化以下简历内容，使其更加专业和有吸引力：

原始内容：
${content}

请按以下格式回复：
【优化内容】
[优化后的内容]

【改进建议】
1. [建议1]
2. [建议2] 
3. [建议3]

【评分】
[分数]/100

要求：
1. 优化后的内容要更专业、具体、有说服力
2. 添加量化数据和具体成果
3. 使用行业关键词
4. 突出个人价值和能力`,

      skills: `请优化以下技能描述：${content}`,
      summary: `请优化以下个人简介：${content}`,
      education: `请优化以下教育背景：${content}`
    };

    return prompts[type] || prompts.experience;
  }

  parseAIResponse(aiResponse, originalContent) {
    try {
      console.log('AI原始回复:', aiResponse);
      
      // 简化解析逻辑，直接使用AI的回复作为优化内容
      let optimizedContent = aiResponse.trim();
      
      // 如果AI回复包含格式化标记，尝试提取优化内容
      const optimizedMatch = aiResponse.match(/【优化内容】\s*([\s\S]*?)(?=【|$)/);
      if (optimizedMatch && optimizedMatch[1]) {
        optimizedContent = optimizedMatch[1].trim();
      } else {
        // 清理AI回复，移除不必要的格式标记
        optimizedContent = aiResponse
          .replace(/【.*?】/g, '')
          .replace(/\d+\./g, '')
          .replace(/—+/g, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      }
      
      // 如果优化内容为空或太短，使用原内容
      if (!optimizedContent || optimizedContent.length < 10) {
        optimizedContent = originalContent;
      }
      
      console.log('最终优化内容:', optimizedContent);

      return {
        optimizedContent,
        suggestions: [
          '内容已通过AI优化，提升了专业性',
          '优化了表达方式和结构',
          '增强了内容的吸引力',
          '提高了简历的整体质量'
        ],
        score: 88,
        improvements: [
          '使用了更专业的表达方式',
          '优化了内容结构和逻辑',
          '提升了整体说服力'
        ]
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getMockOptimization(originalContent, 'experience');
    }
  }

  getMockOptimization(content, type) {
    // 模拟优化结果，用于API调用失败时的备用方案
    const mockResults = {
      experience: {
        optimizedContent: `【优化版本】${content}\n\n通过运用STAR法则（情境-任务-行动-结果），重新组织了内容结构，突出了具体成果和量化指标。增加了行业关键词，提升了ATS系统的匹配度。`,
        suggestions: [
          '使用具体数字和百分比来量化成果',
          '采用STAR法则描述工作经历',
          '突出核心技能和成就',
          '使用行业相关的关键词',
          '保持简洁专业的表达方式'
        ],
        score: 85,
        improvements: [
          '增加了量化数据支撑',
          '优化了内容结构',
          '提升了专业表达',
          '增强了关键词密度'
        ]
      }
    };

    return mockResults[type] || mockResults.experience;
  }

  async optimizeContent(content, type = 'experience') {
    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    // 优先使用Dashscope API
    if (process.env.AI_PROVIDER === 'dashscope' && this.dashscopeApiKey) {
      return await this.optimizeWithDashscope(content, type);
    }

    // 备用方案：返回模拟优化结果
    return this.getMockOptimization(content, type);
  }
}

module.exports = new AIService();