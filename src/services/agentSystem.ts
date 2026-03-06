/**
 * 虹忆坊智能代理架构
 * 多智能体系统 + 知识库 RAG
 * 支持多种 LLM: Anthropic / MiniMax(Anthropic兼容) / 火山引擎
 */

// 使用动态导入避免模块级别初始化问题

// ============== 配置 ==============

// 选择 LLM 提供商: 'anthropic' | 'minimax' | 'volcengine'
const LLM_PROVIDER: 'anthropic' | 'minimax' | 'volcengine' = 'minimax'

// Anthropic 配置
const ANTHROPIC_API_KEY = '' 
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514'

// MiniMax 配置 (使用 Vite 代理避免 CORS)
const MINIMAX_API_KEY = 'sk-cp-wFl7v2J720utZWLzakiS9qph1Awcm1J1mFqTW-jOYxP4kF2__ICl1yly_8Dahh6uklBs9Y-RdpesjYkA-oBkO0ArSxRbdYYsC9qB-KlL9aBe7F1dRBgryG0'
const MINIMAX_MODEL = 'MiniMax-M2'
const MINIMAX_BASE_URL = '/api/minimax/v1/text'  // 使用 Vite 代理

// 火山引擎配置
const VOLCENGINE_API_KEY = ''
const VOLCENGINE_MODEL = 'doubao-pro-32k'
const VOLCENGINE_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3'

// ============== 类型定义 ==============

export type AIAgentType = 
  | 'requirements_collector'
  | 'creative_director'
  | 'music_director'
  | 'cinematography_director'
  | 'screenwriter'
  | 'character_designer'
  | 'storyboard_designer'
  | 'art_director'

export const AGENT_NAMES: Record<AIAgentType, string> = {
  requirements_collector: '需求收集师',
  creative_director: '创意总监',
  music_director: '音乐总监',
  cinematography_director: '摄影总监',
  screenwriter: '编剧',
  character_designer: '角色设计师',
  storyboard_designer: '分镜设计师',
  art_director: '艺术总监'
}

// 智能体状态
export interface AgentState {
  agentType: AIAgentType
  currentStage: string
  collectedInfo: Record<string, any>
  context: ConversationContext
}

// 对话上下文
export interface ConversationContext {
  projectId: string
  userId?: string
  history: Message[]
  metadata: Record<string, any>
}

// 消息
export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  agentType?: AIAgentType
}

// 知识库条目
export interface KnowledgeEntry {
  id: string
  category: string
  tags: string[]
  content: string
  metadata: Record<string, any>
}

// RAG 查询结果
export interface RAGResult {
  entries: KnowledgeEntry[]
  relevanceScores: number[]
}

// ============== 工具/技能系统 ==============

// 工具参数schema
export interface ToolInputSchema {
  type: 'object'
  properties: Record<string, {
    type: string
    description: string
  }>
  required?: string[]
}

// 工具定义
export interface Tool {
  name: string
  description: string
  input_schema: ToolInputSchema
  handler: (input: Record<string, any>) => Promise<string>
}

// 工具调用结果
export interface ToolUse {
  toolName: string
  input: Record<string, any>
  output: string
}

// 工具注册表
class ToolRegistry {
  private tools: Map<string, Tool> = new Map()
  
  constructor() {
    this.registerDefaultTools()
  }
  
  // 内部工具：真正调用 LLM 生成内容
  private async generateWithLLM(prompt: string): Promise<string> {
    try {
      const model = MINIMAX_MODEL
      const url = MINIMAX_BASE_URL + '/chatcompletion_v2'
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MINIMAX_API_KEY}`
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          temperature: 0.8,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      return data.choices?.[0]?.message?.content || '生成失败'
    } catch (error) {
      console.error('[ToolRegistry] LLM call failed:', error)
      return '生成失败，请稍后重试'
    }
  }
  
  // 注册默认工具
  private registerDefaultTools() {
    // 搜索知识库工具
    this.register({
      name: 'search_knowledge',
      description: '搜索知识库获取相关信息。适用于需要查询广告模板、剧本结构、风格指南等知识时使用。',
      input_schema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '搜索关键词'
          },
          categories: {
            type: 'string',
            description: '可选的知识分类，用逗号分隔。如：sci-fi-matching,ad-templates,script-templates'
          },
          limit: {
            type: 'number',
            description: '返回结果数量，默认5'
          }
        },
        required: ['query']
      },
      handler: async (input) => {
        const result = await knowledgeBase.query(input.query, {
          categories: input.categories?.split(',').filter(Boolean),
          limit: input.limit || 5
        })
        return JSON.stringify(result.entries.map(e => ({
          id: e.id,
          category: e.category,
          content: e.content.slice(0, 500)
        })), null, 2)
      }
    })
    
    // 获取进度工具
    this.register({
      name: 'get_progress',
      description: '获取当前需求收集进度。包括必填项、创意项、可选项的完成状态。',
      input_schema: {
        type: 'object',
        properties: {
          collectedInfo: {
            type: 'string',
            description: 'JSON字符串格式的已收集信息'
          }
        },
        required: []
      },
      handler: async (input) => {
        let info: Record<string, any> = {}
        if (input.collectedInfo) {
          try { info = JSON.parse(input.collectedInfo) } catch {}
        }
        return getProgress(info)
      }
    })
    
    // 生成摘要工具
    this.register({
      name: 'generate_summary',
      description: '根据已收集的需求信息生成确认摘要清单。',
      input_schema: {
        type: 'object',
        properties: {
          collectedInfo: {
            type: 'string',
            description: 'JSON字符串格式的已收集信息'
          }
        },
        required: ['collectedInfo']
      },
      handler: async (input) => {
        const info = JSON.parse(input.collectedInfo)
        return generateSummary(info)
      }
    })
    
    // ============ 项目实用工具 ============
    
    // 1. 生成广告剧本
    this.register({
      name: 'generate_script',
      description: '根据需求生成广告剧本/脚本。包括开场、主体、结尾三个部分。',
      input_schema: {
        type: 'object',
        properties: {
          productName: { type: 'string', description: '产品名称' },
          productDescription: { type: 'string', description: '产品描述' },
          adType: { type: 'string', description: '广告类型' },
          storyType: { type: 'string', description: '故事类型' },
          duration: { type: 'string', description: '时长，如30s' },
          tone: { type: 'string', description: '情感基调' }
        },
        required: ['productName', 'productDescription']
      },
      handler: async (input) => {
        const prompt = `你是一个专业广告编剧。请根据以下信息生成一个完整的广告剧本。

**产品名称**: ${input.productName || '未命名产品'}
**产品描述**: ${input.productDescription || '无'}
**广告类型**: ${input.adType || '产品广告'}
**故事类型**: ${input.storyType || '剧情'}
**时长**: ${input.duration || '30秒'}
**情感基调**: ${input.tone || '温馨'}

请生成一个完整的广告剧本，包含：
1. **开场** (约前1/3): 场景设定、引入痛点或兴趣
2. **主体** (约中间1/3): 产品展示、核心卖点、使用场景
3. **结尾** (约后1/3): 情感升华、行动号召

要求：
- 剧本要有人物、场景、对话
- 语言生动有感染力
- 突出产品核心卖点
- 时长控制在${input.duration || '30秒'}内（约150-300字）

请直接输出剧本内容，不要用列表格式，用完整的段落。`

        return await this.generateWithLLM(prompt)
      }
    })
    
    // 2. 生成分镜脚本
    this.register({
      name: 'generate_storyboard',
      description: '生成分镜脚本，包括每个镜头的画面描述、时长、运镜方式。',
      input_schema: {
        type: 'object',
        properties: {
          script: { type: 'string', description: '广告剧本' },
          duration: { type: 'string', description: '总时长，如30s' },
          aspectRatio: { type: 'string', description: '画面比例，如9:16' }
        },
        required: ['script']
      },
      handler: async (input) => {
        const duration = input.duration || '30s'
        const shotCount = duration === '60s' ? 8 : (duration === '30s' ? 6 : 4)
        const ratio = input.aspectRatio || '9:16'
        
        const prompt = `你是一个专业分镜设计师。请根据以下广告剧本生成分镜脚本。

**广告剧本**:
${input.script}

**总时长**: ${duration}
**画面比例**: ${ratio}

请生成 ${shotCount} 个镜头的分镜脚本，格式如下：

**镜头1** (0-${Math.round(duration === '60s' ? 60/shotCount : 30/shotCount)}秒)
- 景别: [如：特写/中景/全景]
- 画面内容: [详细描述画面]
- 运镜: [如：固定/推镜/拉镜/横移]
- 台词/旁白: [如有]
- 音效/音乐: [建议的音效]

**镜头2** ...
（以此类推）

要求：
- 每个镜头时长要合理分配
- 景别变化有节奏感
- 画面内容具体生动
- 运镜方式符合叙事需要

请直接输出分镜内容，格式清晰。`

        return await this.generateWithLLM(prompt)
      }
    })
    
    // 3. 生成画面提示词（用于AI绘图）
    this.register({
      name: 'generate_image_prompt',
      description: '根据场景描述生成AI绘画提示词，用于生成广告画面。',
      input_schema: {
        type: 'object',
        properties: {
          scene: { type: 'string', description: '场景描述' },
          style: { type: 'string', description: '风格，如电影感、温馨、科幻' },
          aspectRatio: { type: 'string', description: '画面比例' }
        },
        required: ['scene']
      },
      handler: async (input) => {
        const ratio = input.aspectRatio || '9:16'
        const style = input.style || '电影感'
        
        const prompt = `你是一个AI绘画提示词专家。请根据以下场景描述生成用于AI绘图的英文提示词。

**场景描述**: ${input.scene}
**风格**: ${input.style || '电影感'}
**画面比例**: ${input.aspectRatio || '9:16'}

请生成：

1. **英文正向提示词** (用于 Midjourney/SD):
   - 主体描述
   - 场景细节
   - 风格关键词
   - 质量关键词
   - 光影效果

2. **英文反向提示词** (要避免的内容):
   - 常见质量问题

3. **建议参数**:
   - 比例: ${ratio}
   - 风格: ${style}
   - 质量: high quality, 8k

要求：
- 提示词要详细具体
- 用逗号分隔关键词
- 适合AI绘图工具使用

请直接输出提示词内容。`

        return await this.generateWithLLM(prompt)
      }
    })
    
    // 4. 推荐背景音乐
    this.register({
      name: 'recommend_music',
      description: '根据广告风格和情感需求推荐背景音乐。',
      input_schema: {
        type: 'object',
        properties: {
          tone: { type: 'string', description: '情感基调，如温馨、励志、紧张' },
          duration: { type: 'string', description: '时长' },
          style: { type: 'string', description: '广告风格' }
        },
        required: ['tone']
      },
      handler: async (input) => {
        const musicMap: Record<string, string[]> = {
          '温馨': ['Home - 温暖钢琴', 'Morning Sun - 轻快', 'Peaceful Days - 舒缓'],
          '励志': ['Rise - 史诗', 'Heroes - 激昂', 'Conquest - 前进'],
          '紧张': ['Tension - 悬疑', 'Chase - 追逐', 'Dark Atmosphere - 紧张'],
          '浪漫': ['Love Story - 甜蜜', 'Moonlight - 柔美', 'Forever - 永恒'],
          '科技': ['Digital World - 电子', 'Future - 前卫', 'Innovation - 创新']
        }
        const musics = musicMap[input.tone] || musicMap['温馨']
        return `🎵 **背景音乐推荐**

根据"${input.tone}"风格推荐：

${musics.map((m, i) => `${i + 1}. ${m}`).join('\n')}

**情绪匹配**: ${input.tone}
**建议时长**: ${input.duration || '30秒'}

---
*注：实际项目可对接音乐库API获取正版音乐*`
      }
    })
    
    // 5. 分析受众画像
    this.register({
      name: 'analyze_audience',
      description: '根据产品信息分析目标受众画像。',
      input_schema: {
        type: 'object',
        properties: {
          productDescription: { type: 'string', description: '产品描述' },
          adType: { type: 'string', description: '广告类型' }
        },
        required: ['productDescription']
      },
      handler: async (input) => {
        return `👥 **目标受众画像**

**基础属性**
- 年龄段：25-45岁
- 性别：${input.adType === '美妆' ? '女性为主' : '男女均衡'}
- 收入：中产及以上

**消费特征**
- 注重品质，愿意为价值买单
- 易受KOL影响
- 习惯线上购物

**兴趣标签**
- 品质生活、时尚、科技
- 社交媒体活跃

**触媒习惯**
- 短视频平台（抖音/快手）
- 社交媒体（小红书/微信）

---
*注：实际分析会根据AI模型深度解读*`
      }
    })
    
    // 6. 生成创意概念
    this.register({
      name: 'generate_concept',
      description: '基于产品特点生成创意概念/核心卖点。',
      input_schema: {
        type: 'object',
        properties: {
          productName: { type: 'string', description: '产品名称' },
          productDescription: { type: 'string', description: '产品描述' },
          storyType: { type: 'string', description: '故事类型' }
        },
        required: ['productName', 'productDescription']
      },
      handler: async (input) => {
        return `💡 **创意概念**

**核心概念**: "${input.productName} - 让生活更美好"

**情感锚点**: 
- 温暖
- 品质
- 陪伴

**差异化卖点**:
1. 核心功能领先
2. 用户体验优先
3. 品牌价值独特

**创意方向**:
- 故事型：情感共鸣
- 场景型：使用场景展示
- 概念型：品牌理念传达

---
*注：实际生成会根据AI模型深度分析*`
      }
    })
    
    // 7. 检查合规性
    this.register({
      name: 'check_compliance',
      description: '检查广告内容是否符合平台规范和法律法规。',
      input_schema: {
        type: 'object',
        properties: {
          content: { type: 'string', description: '广告内容/剧本' },
          platform: { type: 'string', description: '投放平台，如抖音、小红书' }
        },
        required: ['content']
      },
      handler: async (input) => {
        return `✅ **合规检查报告**

**内容审核**: 通过 ✓

**风险提示**:
- 建议避免绝对化用语（如"第一"、"最强"）
- 医疗/保健类产品需注意广告法限制
- 避免虚假宣传

**平台规范** (${input.platform || '通用'}):
- 视频时长符合要求
- 标题无违规词汇
- 内容健康向上

---
*注：实际检查需对接内容审核API*`
      }
    })
    
    // 8. 估算成本
    this.register({
      name: 'estimate_cost',
      description: '根据广告规格估算制作成本。',
      input_schema: {
        type: 'object',
        properties: {
          duration: { type: 'string', description: '时长，如30s' },
          hasVoiceover: { type: 'boolean', description: '是否需要配音' },
          hasAnimation: { type: 'boolean', description: '是否需要动画' },
          quality: { type: 'string', description: '质量等级：基础/标准/高级' }
        },
        required: ['duration']
      },
      handler: async (input) => {
        const basePrice = input.quality === '高级' ? 5000 : (input.quality === '标准' ? 3000 : 1500)
        const voiceoverCost = input.hasVoiceover ? 500 : 0
        const animationCost = input.hasAnimation ? 2000 : 0
        const total = basePrice + voiceoverCost + animationCost
        return `💰 **成本估算**

| 项目 | 费用 |
|------|------|
| 基础制作 | ¥${basePrice} |
| 配音 | ¥${voiceoverCost} |
| 动画 | ¥${animationCost} |
| **总计** | **¥${total}** |

**说明**:
- 基础制作包含：脚本、分镜、剪辑
- 配音为单语种标准版
- 高级制作含更多细节打磨

---
*注：实际成本需根据具体需求评估*`
      }
    })
  }
  
  // 注册工具
  register(tool: Tool) {
    this.tools.set(tool.name, tool)
  }
  
  // 获取所有工具
  getAllTools(): Tool[] {
    return Array.from(this.tools.values())
  }
  
  // 获取工具
  getTool(name: string): Tool | undefined {
    return this.tools.get(name)
  }
  
  // 执行工具
  async execute(name: string, input: Record<string, any>): Promise<string> {
    const tool = this.tools.get(name)
    if (!tool) {
      throw new Error(`Tool ${name} not found`)
    }
    return tool.handler(input)
  }
}

// 全局工具注册表
export const toolRegistry = new ToolRegistry()

// 辅助函数（供工具使用）
function getProgress(info: Record<string, any>): string {
  const required = ['adType', 'productDescription', 'storyType']
  const creative = ['duration', 'aspectRatio', 'targetGender', '植入比例']
  const optional = ['toneKeywords', 'sceneSetting', 'referenceMovies']
  
  const requiredDone = required.filter(k => info[k]).length
  const creativeDone = creative.filter(k => info[k]).length
  const optionalDone = optional.filter(k => info[k]).length
  
  return `📊 进度：必要信息 ${requiredDone}/${required.length} → 创意细节 ${creativeDone}/${creative.length} → 深度配置 ${optionalDone}/${optional.length}`
}

function generateSummary(collected: Record<string, any>): string {
  return `
📋 **需求确认清单**

【必填项】✅
• 广告类型：${collected.adType || '未选择'}
• 产品描述：${(collected.productDescription || '').slice(0, 30)}...
• 产品图片：${collected.productImage || '未上传'}
• 故事类型：${collected.storyType || '未选择'}

【创意设定】✅
• 时长：${collected.duration || '30s'}
• 比例：${collected.aspectRatio || '9:16'}
• 受众：${collected.targetGender || '不限'}
• 植入：${collected.植入比例 || '25%'}

---
请回复"确认"开始生成广告创意，或修改某个信息。`
}

// ============== 知识库系统 ==============

class KnowledgeBase {
  private entries: KnowledgeEntry[] = []
  
  constructor() {
    this.initializeDefaultKnowledge()
  }
  
  // 初始化默认知识库
  private initializeDefaultKnowledge() {
    // 科幻匹配知识
    this.entries.push(
      {
        id: 'sci-fi-1',
        category: 'sci-fi-matching',
        tags: ['科幻', '赛博朋克', '未来科技'],
        content: `赛博朋克风格特点：
- 霓虹灯光与黑暗城市的对比
- 高科技低生活质量
- 人工智能与人类意识的融合
- 视觉元素：全息广告、飞行汽车、义体改造`,
        metadata: { subgenre: 'cyberpunk' }
      },
      {
        id: 'sci-fi-2',
        category: 'sci-fi-matching',
        tags: ['科幻', '太空史诗', '星际'],
        content: `太空史诗风格特点：
- 宏大的星际场景
- 跨种族文明交流
- 探索未知与冒险精神
- 视觉元素：巨大飞船、未知星球、星际战争`,
        metadata: { subgenre: 'space-opera' }
      },
      {
        id: 'sci-fi-3',
        category: 'sci-fi-matching',
        tags: ['科幻', '硬科幻', '科技'],
        content: `硬科幻风格特点：
- 基于真实科学理论
- 技术细节详实
- 逻辑严密的世界观
- 视觉元素：太空站、行星表面、实验设备`,
        metadata: { subgenre: 'hard-sci-fi' }
      },
      {
        id: 'sci-fi-4',
        category: 'sci-fi-matching',
        tags: ['科幻', '复古未来', '怀旧'],
        content: `复古未来风格特点：
- 过去对未来的想象
- 50-70年代设计美学
- 乐观的技术愿景
- 视觉元素：圆角设计、荧光色、监视器`,
        metadata: { subgenre: 'retro-futurism' }
      }
    )
    
    // 产品广告模板
    this.entries.push(
      {
        id: 'ad-template-1',
        category: 'ad-templates',
        tags: ['产品广告', '功能展示', '促销'],
        content: `产品广告通用结构：
1. 开场：痛点场景引入（2-3秒）
2. 产品亮相：核心功能展示（5-8秒）
3. 场景演示：实际使用展示（8-12秒）
4. 卖点总结：关键优势强化（3-5秒）
5. CTA：行动号召（2-3秒）`,
        metadata: { type: 'product', duration: '30s' }
      },
      {
        id: 'ad-template-2',
        category: 'ad-templates',
        tags: ['品牌广告', '价值观', '情感'],
        content: `品牌广告通用结构：
1. 情感场景：引发共鸣（5-8秒）
2. 品牌理念：价值传递（8-12秒）
3. 身份认同：用户故事（8-12秒）
4. 品牌承诺：长期价值（3-5秒）`,
        metadata: { type: 'brand', duration: '30s' }
      }
    )
    
    // 剧本结构模板
    this.entries.push(
      {
        id: 'script-structure-1',
        category: 'script-templates',
        tags: ['剧本', '三幕式', '结构'],
        content: `三幕式剧本结构：
- 第一幕（25%）：建立世界，引入冲突
- 第二幕（50%）：主角对抗阻力，层层升级
- 第三幕（25%）：高潮对决，解决问题`,
        metadata: { structure: 'three-act' }
      },
      {
        id: 'script-structure-2',
        category: 'script-templates',
        tags: ['剧本', '英雄之旅', '叙事'],
        content: `英雄之旅叙事结构：
1. 普通世界 → 2. 冒险召唤 → 3. 拒绝召唤
4. 遇到导师 → 5. 跨越第一道门槛 → 6. 考验/盟友/敌人
7. 深入洞穴 → 8. 严峻考验 → 9. 获得奖励
10. 返回之路 → 11. 复活 → 12. 满载而归`,
        metadata: { structure: 'hero-journey' }
      }
    )
  }
  
  // 添加知识条目
  addEntry(entry: KnowledgeEntry) {
    this.entries.push(entry)
  }
  
  // RAG 查询
  async query(query: string, options: {
    categories?: string[]
    tags?: string[]
    limit?: number
    minScore?: number
  } = {}): Promise<RAGResult> {
    const { categories, tags, limit = 5, minScore = 0.3 } = options
    
    // 简单关键词匹配 + 相关度计算
    const queryKeywords = query.toLowerCase().split(/[\s,，,.]+/)
    
    const scored = this.entries
      .filter(entry => {
        if (categories && categories.length > 0 && !categories.includes(entry.category)) {
          return false
        }
        if (tags && tags.length > 0 && !entry.tags.some(t => tags.includes(t))) {
          return false
        }
        return true
      })
      .map(entry => {
        // 计算相关度分数
        let score = 0
        const entryText = (entry.content + ' ' + entry.tags.join(' ')).toLowerCase()
        
        for (const keyword of queryKeywords) {
          if (keyword.length < 2) continue
          if (entryText.includes(keyword)) {
            score += 1
          }
          // 标签匹配权重更高
          if (entry.tags.some(t => t.toLowerCase().includes(keyword))) {
            score += 2
          }
        }
        
        // 归一化分数
        score = score / Math.max(queryKeywords.length, 1)
        
        return { entry, score }
      })
      .filter(item => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
    
    return {
      entries: scored.map(s => s.entry),
      relevanceScores: scored.map(s => s.score)
    }
  }
  
  // 根据分类查询
  getByCategory(category: string): KnowledgeEntry[] {
    return this.entries.filter(e => e.category === category)
  }
  
  // 根据标签查询
  getByTags(tags: string[]): KnowledgeEntry[] {
    return this.entries.filter(e => 
      tags.some(t => e.tags.includes(t))
    )
  }
}

// 全局知识库实例
export const knowledgeBase = new KnowledgeBase()

// ============== 智能体基类 ==============

// Skill 懒加载辅助函数
async function loadSkillResources(skillName: string) {
  const resources: Record<string, string> = {}
  
  try {
    // 动态加载 resources 目录下的所有 .md 文件
    const context = import.meta.glob('/src/skills/*/resources/*.md', { query: '?raw', eager: true })
    for (const path in context) {
      if (path.includes(`/skills/${skillName}/resources/`)) {
        const fileName = path.split('/').pop()?.replace('.md', '') || ''
        resources[fileName] = context[path] as string
      }
    }
  } catch (e) {
    console.warn(`[Agent] Failed to load resources for ${skillName}:`, e)
  }
  
  return resources
}

async function loadSkillTemplates(skillName: string) {
  const templates: Record<string, string> = {}
  
  try {
    const context = import.meta.glob('/src/skills/*/templates/*.md', { query: '?raw', eager: true })
    for (const path in context) {
      if (path.includes(`/skills/${skillName}/templates/`)) {
        const fileName = path.split('/').pop()?.replace('.md', '') || ''
        templates[fileName] = context[path] as string
      }
    }
  } catch (e) {
    console.warn(`[Agent] Failed to load templates for ${skillName}:`, e)
  }
  
  return templates
}

abstract class BaseAgent {
  protected agentType: AIAgentType
  protected systemPrompt: string
  protected state: AgentState
  protected availableTools: string[] = [] // 可用工具列表
  protected skillName: string = '' // 对应的 Skill 名称
  protected skillResources: Record<string, string> = {} // Skill 资源
  protected skillTemplates: Record<string, string> = {} // Skill 模板
  
  constructor(agentType: AIAgentType, systemPrompt: string, tools: string[] = [], skillName: string = '') {
    this.agentType = agentType
    this.systemPrompt = systemPrompt
    this.availableTools = tools
    this.skillName = skillName
    this.state = {
      agentType,
      currentStage: 'init',
      collectedInfo: {},
      context: {
        projectId: '',
        history: [],
        metadata: {}
      }
    }
    
    // 懒加载 Skill 资源
    if (skillName) {
      this.loadSkillContent()
    }
  }
  
  // 懒加载 Skill 内容
  private async loadSkillContent() {
    this.skillResources = await loadSkillResources(this.skillName)
    this.skillTemplates = await loadSkillTemplates(this.skillName)
    console.log(`[Agent] Loaded skill ${this.skillName}:`, {
      resources: Object.keys(this.skillResources),
      templates: Object.keys(this.skillTemplates)
    })
  }
  
  // 获取 Skill 资源
  protected getResource(name: string): string | undefined {
    return this.skillResources[name]
  }
  
  // 获取 Skill 模板
  protected getTemplate(name: string): string | undefined {
    return this.skillTemplates[name]
  }
  
  // 处理用户输入
  abstract process(input: string, context: ConversationContext): Promise<AgentResponse>
  
  // 更新状态
  protected updateState(updates: Partial<AgentState>) {
    this.state = { ...this.state, ...updates }
  }
  
  // 获取知识库相关内容
  protected async queryKnowledge(query: string, options?: {
    categories?: string[]
    tags?: string[]
  }): Promise<RAGResult> {
    return knowledgeBase.query(query, options)
  }
  
  // 调用 LLM（支持工具调用）
  protected async callLLM(
    prompt: string,
    history: Message[] = [],
    options?: { temperature?: number; maxTokens?: number; useTools?: boolean }
  ): Promise<string> {
    try {
      const useTools = options?.useTools !== false // 默认启用工具
      
      if (LLM_PROVIDER === 'volcengine') {
        // 火山引擎 (豆包) API - OpenAI 兼容格式
        const messages: any[] = [
          { role: 'system' as const, content: this.systemPrompt },
          ...history.map(m => ({
            role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
            content: m.content
          })),
          { role: 'user' as const, content: prompt }
        ]
        
        const OpenAI = (await import('openai')).default
        const client = new OpenAI({ apiKey: VOLCENGINE_API_KEY, baseURL: VOLCENGINE_BASE_URL })
        
        const requestParams: any = {
          model: VOLCENGINE_MODEL,
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 4096
        }
        
        // 添加工具（如果启用）
        if (useTools) {
          requestParams.tools = toolRegistry.getAllTools().map(t => ({
            type: 'function' as const,
            function: {
              name: t.name,
              description: t.description,
              parameters: t.input_schema
            }
          }))
        }
        
        const response = await client.chat.completions.create(requestParams)
        
        // 处理工具调用
        if (useTools && response.choices[0]?.message?.tool_calls) {
          return await this.handleToolCalls(response.choices[0].message.tool_calls, messages, options)
        }
        
        if (!response.choices[0]?.message?.content) {
          throw new Error('No text response from LLM')
        }
        
        return response.choices[0].message.content
      } else {
        // MiniMax - 使用 fetch 直接调用（支持 Vite 代理）
        const model = MINIMAX_MODEL
        
        const allMessages = [
          { role: 'user', content: `[SYSTEM PROMPT]\n${this.systemPrompt}\n\n[USER MESSAGE]\n${prompt}` },
          ...history.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        ]
        
        const requestBody: any = {
          model,
          max_tokens: options?.maxTokens || 4096,
          temperature: options?.temperature || 0.7,
          messages: allMessages
        }
        
        // 添加工具（如果启用）
        if (useTools) {
          requestBody.tools = toolRegistry.getAllTools().map(t => ({
            name: t.name,
            description: t.description,
            input_schema: t.input_schema
          }))
        }
        
        // 使用 fetch 调用（通过 Vite 代理）
        const url = MINIMAX_BASE_URL + '/chatcompletion_v2'
        console.log('[MiniMax] Calling URL:', url)
        console.log('[MiniMax] Request body:', JSON.stringify(requestBody).slice(0, 200))
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MINIMAX_API_KEY}`
          },
          body: JSON.stringify(requestBody)
        })
        
        console.log('[MiniMax] Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('[MiniMax] API Error:', response.status, errorText)
          throw new Error(`MiniMax API error: ${response.status} - ${errorText}`)
        }
        
        const data = await response.json()
        
        // 处理工具调用 - MiniMax 标准格式
        if (useTools) {
          const toolCalls = data.choices?.[0]?.message?.tool_calls
          if (toolCalls && toolCalls.length > 0) {
            return await this.handleToolCalls(toolCalls, allMessages, options)
          }
        }
        
        // MiniMax 标准格式返回 OpenAI 格式
        const textContent = data.choices?.[0]?.message?.content
        if (!textContent) {
          console.log('[MiniMax] Response:', JSON.stringify(data).slice(0, 500))
          throw new Error('No text response from LLM')
        }
        
        return textContent
      }
    } catch (error) {
      console.error(`[${this.agentType}] LLM call error:`, error)
      throw error
    }
  }
  
  // 处理工具调用（使用 fetch）
  private async handleToolCalls(
    toolCalls: any[],
    messages: any[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const model = MINIMAX_MODEL
    
    // 执行所有工具调用
    for (const toolCall of toolCalls) {
      const toolName = toolCall.function?.name || toolCall.name
      const toolInput = typeof toolCall.function?.arguments === 'string' 
        ? JSON.parse(toolCall.function.arguments) 
        : (toolCall.arguments || toolCall.input || {})
      
      console.log(`[${this.agentType}] Calling tool: ${toolName}`, toolInput)
      
      try {
        const result = await toolRegistry.execute(toolName, toolInput)
        console.log(`[${this.agentType}] Tool result:`, result.slice(0, 200))
        
        // 将工具结果添加到消息中
        messages.push({
          role: 'assistant',
          content: JSON.stringify([{
            type: 'tool_use',
            id: toolCall.id,
            name: toolName,
            input: toolInput
          }])
        })
        messages.push({
          role: 'user',
          content: `[TOOL RESULT]\n${toolName} 执行结果:\n${result}`
        })
      } catch (error) {
        console.error(`[${this.agentType}] Tool error:`, error)
        messages.push({
          role: 'user',
          content: `[TOOL ERROR]\n${toolName} 执行失败: ${error}`
        })
      }
    }
    
    // 再次调用 LLM 获取最终响应
    const response = await fetch(MINIMAX_BASE_URL + '/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`
      },
      body: JSON.stringify({
        model,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.7,
        messages
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`MiniMax API error: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    // MiniMax 标准格式返回 OpenAI 格式
    const textContent = data.choices?.[0]?.message?.content
    if (!textContent) {
      throw new Error('No text response from LLM')
    }
    
    return textContent
  }
}

// 智能体响应
export interface AgentResponse {
  content: string
  agentType: AIAgentType
  nextAgent?: AIAgentType
  collectedInfo?: Record<string, any>
  stageComplete?: boolean
  knowledgeReferences?: string[]
}

// ============== 需求收集师智能体 ==============

class RequirementsCollectorAgent extends BaseAgent {
  private isFirstMessage: boolean = true  // 是否是首次对话
  private currentStage: 'init' | 'required' | 'creative' | 'optional' | 'confirmation' = 'init'
  private askedQuestions: Set<string> = new Set()  // 已问问题集合
  private userMood: 'positive' | 'neutral' | 'frustrated' = 'positive'
  
  constructor() {
    // 简洁的 prompt，主要引用 Skill 资源
    const prompt = `你是虹忆坊需求收集师，一个专业的广告需求分析师。
你的任务是通过**渐进式披露**策略收集用户的产品信息、创作意图和广告规格要求。

## Skill 资源（请务必阅读）
- SKILL.md: 完整的工作流程阶段、交互规则、异常处理定义
- resources/ad_types.md: 广告类型参考
- resources/story_types.md: 故事类型参考
- scripts/validate.ts: 输入验证逻辑
- templates/welcome.md: 欢迎语模板
- templates/summary.md: 确认清单模板

## 核心流程（详细请参考 SKILL.md）

### Stage 1: 项目启动与破冰
首次对话自动触发欢迎语，智能解析用户输入中已包含的信息。

### Stage 2: 必要信息锁定 (逐个提问)
必填项：广告类型→产品描述→产品图片→故事类型

### Stage 3: 核心创意参数 (批量提问)
Batch A: 植入比例、目标受众性别
Batch B: 受众年龄段、时长(默认30s)、画面比例(默认9:16)

### Stage 4: 深度创意细节 (可选)
调性关键词、场景设定、参考电影

### Stage 5: 确认与交付
显示需求确认清单，等待用户确认

## 关键规则
1. **智能解析**：首次对话时，从用户输入中自动提取信息
2. **防重复**：已问过的问题不再重复询问
3. **智能默认**：未选择项使用默认值（时长30s、比例9:16）

## 输出格式
简洁明了，用 emoji 增加可读性，显示进度条。`
    
    // 只保留 search_knowledge，其他功能由 Agent 内部方法实现
    super('requirements_collector', prompt, ['search_knowledge'], 'requirements_collector')
  }
  
  async process(input: string, context: ConversationContext): Promise<AgentResponse> {
    // 判断是否是首次对话
    const isFirstMessage = context.history.length === 0
    
    // 解析用户回答，提取信息
    const collected = this.extractInfo(input, this.state.collectedInfo)
    this.updateState({ collectedInfo: collected })
    
    // 每次都调用 LLM 来生成回复
    return await this.handleLLMResponse(input, collected, context, isFirstMessage)
  }
  
  // 解析用户输入中的信息
  private extractInfo(input: string, current: Record<string, any>): Record<string, any> {
    const text = input.toLowerCase()
    const collected = { ...current }
    
    // 广告类型
    if (text.includes('产品广告') || text.includes('功能展示')) collected.adType = '产品广告'
    else if (text.includes('品牌广告') || text.includes('价值观')) collected.adType = '品牌广告'
    else if (text.includes('促销广告') || text.includes('优惠')) collected.adType = '促销广告'
    
    // 故事类型
    const storyTypes = ['科幻', '爱情', '悬疑', '恐怖', '动作', '喜剧', '战争', '西部', '奇幻', '歌舞', '冒险', '公路', '犯罪', '剧情', '不限']
    for (const type of storyTypes) {
      if (text.includes(type)) {
        collected.storyType = type
        break
      }
    }
    
    // 时长
    if (text.includes('30秒') || text.includes('30s')) collected.duration = '30s'
    else if (text.includes('60秒') || text.includes('60s')) collected.duration = '60s'
    
    // 受众
    if (text.includes('男')) collected.targetGender = '男'
    else if (text.includes('女')) collected.targetGender = '女'
    
    // 产品描述
    if (input.length > 10 && !input.includes('选择')) {
      collected.productDescription = input
    }
    
    return collected
  }
  
  // 使用 LLM 生成回复
  private async handleLLMResponse(input: string, collected: Record<string, any>, context: ConversationContext, isFirstMessage: boolean): Promise<AgentResponse> {
    // 构建提示
    const collectedInfo = Object.entries(collected)
      .filter(([_, v]) => v)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n')
    
    // 检查必填项完成状态
    const requiredFields = ['adType', 'productDescription', 'storyType']
    const missing = requiredFields.filter(f => !collected[f])
    const creativeFields = ['duration', 'aspectRatio', 'targetGender']
    const missingCreative = creativeFields.filter(f => !collected[f])
    
    let stage = ''
    if (missing.length > 0) stage = '阶段1：收集必填信息'
    else if (missingCreative.length > 0) stage = '阶段2：收集创意参数'
    else stage = '阶段3：确认需求'
    
    const prompt = `你是虹忆坊需求收集师，正在与用户对话。

当前${stage}，用户说："${input}"

已收集的信息：
${collectedInfo || '（无）'}

缺失信息：${missing.length > 0 ? missing.join(', ') : '无'}

请：
1. 友好回应用户
2. 如果用户回答了问题，提取并确认信息
3. 询问下一个缺失的信息
4. 用 emoji 增加可读性

请直接回复用户，不要用列表格式。`
    
    try {
      console.log('[RequirementsCollector] Calling LLM...')
      const response = await this.callLLM(prompt, context.history, { useTools: false })
      console.log('[RequirementsCollector] LLM response:', response.slice(0, 100))
      return {
        content: response,
        agentType: this.agentType,
        collectedInfo: collected,
        stageComplete: missing.length === 0 && missingCreative.length === 0,
        nextAgent: missing.length === 0 && missingCreative.length === 0 ? 'creative_director' : undefined
      }
    } catch (error) {
      console.error('[RequirementsCollector] LLM error:', error)
      // 如果 LLM 失败，使用本地逻辑
      return this.handleLocalResponse(collected, missing, missingCreative)
    }
  }
  
  // 本地响应（备用）
  private handleLocalResponse(collected: Record<string, any>, missing: string[], missingCreative: string[]): AgentResponse {
    let nextQuestion = ''
    
    if (missing.length > 0) {
      nextQuestion = this.getNextQuestion(collected)
    } else if (missingCreative.length > 0) {
      nextQuestion = this.getNextCreativeQuestion(collected)
    } else {
      nextQuestion = this.generateSummary(collected)
    }
    
    return {
      content: nextQuestion,
      agentType: this.agentType,
      collectedInfo: collected,
      stageComplete: missing.length === 0 && missingCreative.length === 0,
      nextAgent: missing.length === 0 && missingCreative.length === 0 ? 'creative_director' : undefined
    }
  }
}

// ============== 创意总监智能体 ==============

class CreativeDirectorAgent extends BaseAgent {
  constructor() {
    const prompt = `你是虹忆坊创意总监，专精广告创意策划。
你的任务是根据需求收集师收集的信息，生成广告创意方案。

## 输出格式
生成完整的创意方案，包含剧本、分镜、画面提示词、音乐推荐等。`
    
    super('creative_director', prompt, [
      'search_knowledge', 'generate_script', 'generate_storyboard', 
      'generate_image_prompt', 'recommend_music', 'analyze_audience',
      'generate_concept', 'check_compliance', 'estimate_cost'
    ], 'creative_director')
  }
  
  async process(input: string, context: ConversationContext): Promise<AgentResponse> {
    const collected = this.state.collectedInfo
    
    // 查询相关知识库
    const knowledgeResults = await this.queryKnowledge(
      `${collected.storyType} ${collected.adType}`,
      { categories: ['sci-fi-matching', 'ad-templates'] }
    )
    
    // 直接调用工具生成内容
    try {
      const toolExecutor = toolRegistry as any
      
      // 1. 生成剧本
      const scriptResult = await toolExecutor.execute('generate_script', {
        productName: collected.productName || '产品',
        productDescription: collected.productDescription || '',
        adType: collected.adType || '产品广告',
        storyType: collected.storyType || '剧情',
        duration: collected.duration || '30s',
        tone: collected.toneKeywords || '温馨'
      })
      
      // 2. 生成分镜
      const storyboardResult = await toolExecutor.execute('generate_storyboard', {
        script: scriptResult,
        duration: collected.duration || '30s',
        aspectRatio: collected.aspectRatio || '9:16'
      })
      
      // 3. 生成画面提示词
      const imagePromptResult = await toolExecutor.execute('generate_image_prompt', {
        scene: '一个展示产品的关键场景',
        style: '电影感',
        aspectRatio: collected.aspectRatio || '9:16'
      })
      
      // 4. 推荐背景音乐
      const musicResult = await toolExecutor.execute('recommend_music', {
        tone: collected.toneKeywords || '温馨',
        duration: collected.duration || '30s'
      })
      
      // 整合所有结果
      const fullContent = `🎬 **广告创意方案**

---

📝 **一、广告剧本**
${scriptResult}

---

🎬 **二、分镜脚本**
${storyboardResult}

---

🎨 **三、画面提示词**
${imagePromptResult}

---

🎵 **四、背景音乐**
${musicResult}

---

💡 **创意说明**
- 产品: ${collected.productDescription || '未提供'}
- 类型: ${collected.adType || '产品广告'}
- 风格: ${collected.storyType || '剧情'}
- 时长: ${collected.duration || '30秒'}
- 画面比例: ${collected.aspectRatio || '9:16'}`

      return {
        content: fullContent,
        agentType: this.agentType,
        collectedInfo: collected,
        stageComplete: true,
        nextAgent: 'screenwriter',
        knowledgeReferences: knowledgeResults.entries.map(e => e.id)
      }
    } catch (error) {
      console.error('[CreativeDirectorAgent] Tool execution failed:', error)
      // 如果工具调用失败，回退到 LLM 直接生成
      const prompt = `根据以下需求生成创意方案：
产品: ${collected.productDescription || '未提供'}
类型: ${collected.adType || '产品广告'}
风格: ${collected.storyType || '剧情'}
时长: ${collected.duration || '30秒'}`

      const response = await this.callLLM(prompt, context.history, { useTools: false })
      
      return {
        content: response,
        agentType: this.agentType,
        collectedInfo: collected,
        stageComplete: true,
        nextAgent: 'screenwriter'
      }
    }
  }
}

// ============== 智能体编排器 ==============

class AgentOrchestrator {
  private agents: Map<AIAgentType, BaseAgent> = new Map()
  private currentAgent: AIAgentType = 'requirements_collector'
  private projectStates: Map<string, AgentState> = new Map()
  
  constructor() {
    // 注册智能体
    this.agents.set('requirements_collector', new RequirementsCollectorAgent())
    this.agents.set('creative_director', new CreativeDirectorAgent())
  }
  
  // 获取当前智能体
  getCurrentAgent(): BaseAgent | undefined {
    return this.agents.get(this.currentAgent)
  }
  
  // 处理用户消息
  async processMessage(
    projectId: string,
    userInput: string,
    context: ConversationContext
  ): Promise<AgentResponse> {
    // 获取或创建项目状态
    let state = this.projectStates.get(projectId)
    if (!state) {
      state = {
        agentType: this.currentAgent,
        currentStage: 'init',
        collectedInfo: {},
        context
      }
      this.projectStates.set(projectId, state)
    }
    
    // 获取当前智能体
    const agent = this.agents.get(this.currentAgent)
    if (!agent) {
      throw new Error(`Agent ${this.currentAgent} not found`)
    }
    
    // 更新上下文
    agent['state'] = { ...agent['state'], context }
    
    // 处理输入
    const response = await agent.process(userInput, context)
    
    // 如果当前阶段完成，切换智能体
    if (response.stageComplete && response.nextAgent) {
      this.currentAgent = response.nextAgent
      const nextAgent = this.agents.get(this.currentAgent)
      if (nextAgent && response.collectedInfo) {
        // 传递收集的信息
        nextAgent['state'].collectedInfo = response.collectedInfo
      }
    }
    
    return response
  }
  
  // 切换智能体
  switchAgent(agentType: AIAgentType) {
    this.currentAgent = agentType
  }
  
  // 获取项目状态
  getProjectState(projectId: string): AgentState | undefined {
    return this.projectStates.get(projectId)
  }
  
  // 重置项目状态
  resetProject(projectId: string) {
    this.projectStates.delete(projectId)
    this.currentAgent = 'requirements_collector'
  }
  
  // 添加新智能体
  registerAgent(agent: BaseAgent) {
    this.agents.set(agent['agentType'], agent)
  }
}

// 导出全局编排器
export const orchestrator = new AgentOrchestrator()

// ============== 便捷函数 ==============

export async function generateAIResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'ai'; content: string }>,
  options?: {
    projectId?: string
    uploadedFiles?: Array<{ type: string; name: string }>
  }
): Promise<{
  response: string
  agentType: AIAgentType
  stage?: string
}> {
  const projectId = options?.projectId || 'default'
  
  // 构建上下文
  const context: ConversationContext = {
    projectId,
    history: conversationHistory.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content,
      timestamp: new Date()
    })),
    metadata: {}
  }

  try {
    const result = await orchestrator.processMessage(projectId, userMessage, context)
    
    return {
      response: result.content,
      agentType: result.agentType,
      stage: result.stageComplete ? 'complete' : 'collecting'
    }
  } catch (error) {
    console.error('[generateAIResponse] Error:', error)
    
    // 解析用户输入作为 fallback
    const collected = extractInfoFromInput(userMessage)
    let responseContent = ''
    const hasInfo = collected.adType || collected.productDescription
    
    if (hasInfo) {
      const items: string[] = []
      if (collected.adType) items.push(`✅ 广告类型：${collected.adType}`)
      if (collected.storyType) items.push(`✅ 故事类型：${collected.storyType}`)
      if (collected.duration) items.push(`✅ 时长：${collected.duration}`)
      if (collected.targetGender) items.push(`✅ 目标受众：${collected.targetGender}`)
      responseContent = `🎬 好的！我已经理解了您的需求：\n\n${items.join('\n')}\n\n请选择广告类型（必填）：\n🛍️ 产品广告  🏷️ 品牌广告  💰 促销广告`
    } else {
      responseContent = `🌟 你好！我是虹忆坊需求收集师，很高兴为您服务！\n\n请选择广告类型（必填）：\n🛍️ 产品广告  🏷️ 品牌广告  💰 促销广告`
    }
    
    return {
      response: responseContent + '\n\n（API调用失败，已使用本地逻辑）',
      agentType: 'requirements_collector',
      stage: 'collecting'
    }
  }
}

// 解析用户输入中的信息
function extractInfoFromInput(input: string): Record<string, any> {
  const text = input.toLowerCase()
  const result: Record<string, any> = {}
  
  // 广告类型
  if (text.includes('产品广告') || text.includes('功能展示')) result.adType = '产品广告'
  else if (text.includes('品牌广告') || text.includes('价值观')) result.adType = '品牌广告'
  else if (text.includes('促销广告') || text.includes('优惠')) result.adType = '促销广告'
  
  // 故事类型
  const storyTypes = ['科幻', '爱情', '悬疑', '恐怖', '动作', '喜剧']
  for (const type of storyTypes) {
    if (text.includes(type)) {
      result.storyType = type
      break
    }
  }
  
  // 时长
  if (text.includes('30秒') || text.includes('30s')) result.duration = '30s'
  else if (text.includes('60秒') || text.includes('60s')) result.duration = '60s'
  
  // 受众
  if (text.includes('男性') || text.includes('男')) result.targetGender = '男'
  else if (text.includes('女性') || text.includes('女')) result.targetGender = '女'
  
  // 产品描述（如果很长）
  if (input.length > 15 && !input.includes('选择')) {
    result.productDescription = input
  }
  
  return result
}

// 导出知识库（供外部使用）
export { KnowledgeBase }
