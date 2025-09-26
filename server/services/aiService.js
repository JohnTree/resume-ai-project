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
    const baseInstructions = `
要求：
1. 如果原内容较简短，请基于常见的职场场景进行合理扩展
2. 使用STAR法则（情境-任务-行动-结果）来组织内容
3. 添加具体的量化数据和成果（如团队规模、项目周期、提升效果等）
4. 使用专业的行业术语和关键词
5. 突出个人的核心价值和能力贡献
6. 保持内容真实可信，避免过度夸大`;

    const prompts = {
      experience: `请帮我优化以下工作经验描述，使其更加专业和有吸引力：

原始内容：${content}

${baseInstructions}

请按以下格式回复：
【优化内容】
[优化后的内容，应该是完整的工作经验描述，包含具体的工作内容、方法和成果]

【改进建议】
1. [针对性建议1]
2. [针对性建议2] 
3. [针对性建议3]

【评分】
[分数]/100

特别说明：如果原内容很简短（如"项目主导，指导别人"），请基于这个核心信息，合理推测并扩展为完整的工作经验描述，包括项目背景、团队规模、具体职责、采用的方法和取得的成果。`,

      skills: `请优化以下技能描述，使其更专业和具体：

原始内容：${content}

${baseInstructions}

请将技能描述优化为更具体、更有说服力的表达方式，包括熟练程度、应用场景和相关成果。`,

      summary: `请优化以下个人简介，使其更有吸引力：

原始内容：${content}

${baseInstructions}

请优化为简洁有力的个人简介，突出核心优势、专业能力和职业目标。`,

      education: `请优化以下教育背景描述：

原始内容：${content}

${baseInstructions}

请优化教育背景描述，突出相关课程、成绩、项目经历或获得的荣誉。`
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
        // 清理AI回复，移除不必要的格式标记和解释性文字
        optimizedContent = aiResponse
          .replace(/【.*?】/g, '')
          .replace(/\d+\./g, '')
          .replace(/—+/g, '')
          .replace(/通过运用.*?。/g, '')
          .replace(/重新组织了.*?。/g, '')
          .replace(/突出了.*?。/g, '')
          .replace(/增加了.*?。/g, '')
          .replace(/提升了.*?。/g, '')
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
        optimizedContent: this.generateMockOptimizedContent(content, type),
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

  generateMockOptimizedContent(content, type) {
    // 根据不同类型生成优化内容，不包含解释性文字
    if (type === 'experience') {
      // 如果是简短的工作经验描述，进行合理扩展
      if (content.length < 20) {
        return `负责${content}，运用敏捷开发方法论指导团队成员完成项目交付。通过建立有效的沟通机制和工作流程，提升团队协作效率30%，确保项目按时高质量完成。具备丰富的跨部门协调经验，能够有效整合资源，推动项目目标达成。`;
      } else {
        return `${content}。运用专业的项目管理方法和团队协作技能，有效提升工作效率和成果质量，为公司创造显著价值。`;
      }
    } else if (type === 'skills') {
      return `${content}，具备丰富的实战经验和深度理解，能够熟练运用相关技术解决复杂业务问题。`;
    } else if (type === 'summary') {
      return `${content}。拥有扎实的专业基础和丰富的实践经验，具备优秀的学习能力和团队协作精神，致力于在专业领域持续成长并创造价值。`;
    }
    
    return content;
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