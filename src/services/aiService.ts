/**
 * AI Service for 虹忆坊智能代理
 * 需求收集师 - 通过结构化对话收集用户需求
 */

const MINIMAX_API_KEY = 'sk-cp-Hdpam27OvKPbjs7qUEB93_-mFSXB-ygC6wBcGuKJVCyD0AUSgzAYDt7t218wGW-1MkFLYXpDzvkIYpTv98kYbAefcp16tigaD78zubr8GkpaP5LgeZGZrl8'
const MINIMAX_MODEL = 'MiniMax-M2.5'
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2'

// ============== Types ==============

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

interface CollectedInfo {
  adType?: string
  productDescription?: string
  productImage?: string
  storyType?: string
  植入比例?: string
  targetGender?: string
  targetAge?: string
  duration?: string
  aspectRatio?: string
  concept?: string
  emotion?: string
  narrator?: string
  toneKeywords?: string
  sceneSetting?: string
  referenceMovies?: string
  characterName?: string
  characterDesc?: string
  storyPoints?: string
  [key: string]: string | undefined
}

interface GeneratedContent {
  storyOutline: string
  script: string[]
  visualStatus: 'pending' | 'generating' | 'completed'
}

interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface MiniMaxResponse {
  id: string
  choices: Array<{
    message: { role: string; content: string }
    finish_reason: string
  }>
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

// ============== Questions Configuration ==============

interface Question {
  key: string
  text: string
  required: boolean
  stage: 'required' | 'creative' | 'optional'
}

const QUESTIONS: Question[] = [
  // 阶段2：必填信息
  { key: 'adType', text: '请选择本次创作的广告类型：\n🛍️ 产品广告（突出单品功能，促进转化）\n🏷️ 品牌广告（传递品牌价值观，提升认知）\n💰 促销广告（限时优惠，催促行动）', required: true, stage: 'required' },
  { key: 'productDescription', text: '请描述您的产品名称、核心功能与卖点（建议50-200字，突出最关键的三个优势）：', required: true, stage: 'required' },
  { key: 'productImage', text: '请上传产品高清图片（支持JPG/PNG，建议白底或场景图，用于视觉参考），或告诉我暂时没有图片', required: true, stage: 'required' },
  { key: 'storyType', text: '您希望广告采用什么叙事风格？\n[不限] [科幻] [爱情] [悬疑] [恐怖] [动作] [喜剧] [战争] [西部] [奇幻] [歌舞] [冒险] [公路] [犯罪] [剧情]', required: true, stage: 'required' },
  // 阶段3：创意参数
  { key: '植入比例', text: '产品植入比例？\n[10%] [25%] [40%] [50%]', required: false, stage: 'creative' },
  { key: 'targetGender', text: '目标受众性别？\n[男] [女] [不限]', required: false, stage: 'creative' },
  { key: 'targetAge', text: '目标受众年龄段？\n[儿童] [青年] [成年] [老年] [不限]（可多选）', required: false, stage: 'creative' },
  { key: 'duration', text: '广告时长？\n[15s] [30s] [60s] [90s] [120s]（默认30s）', required: false, stage: 'creative' },
  { key: 'aspectRatio', text: '画面比例？\n[16:9 横屏] [9:16 竖屏]（默认9:16）', required: false, stage: 'creative' },
  { key: 'concept', text: '广告核心创作概念（一句话策略，不超过30字，可选）', required: false, stage: 'creative' },
  { key: 'emotion', text: '结尾希望用户看完的感受是什么？', required: false, stage: 'creative' },
  { key: 'narrator', text: '是否有旁白？\n[是] [否]（默认否）', required: false, stage: 'creative' },
  // 阶段4：深度细节
  { key: 'toneKeywords', text: '产品调性关键词（可选，如：科技感、轻奢、亲民，专业）', required: false, stage: 'optional' },
  { key: 'sceneSetting', text: '主要场景设定（可选）', required: false, stage: 'optional' },
  { key: 'referenceMovies', text: '参考电影（可选，如：银翼杀手、布达佩斯大饭店）', required: false, stage: 'optional' },
  { key: 'characterName', text: '角色名称（可选）', required: false, stage: 'optional' },
  { key: 'characterDesc', text: '角色描述（可选）', required: false, stage: 'optional' },
  { key: 'storyPoints', text: '必须包含的情节或镜头（可选）', required: false, stage: 'optional' },
]

const REQUIRED_QUESTIONS = QUESTIONS.filter(q => q.required)
const CREATIVE_QUESTIONS = QUESTIONS.filter(q => q.stage === 'creative')
const OPTIONAL_QUESTIONS = QUESTIONS.filter(q => q.stage === 'optional')

// ============== System Prompt ==============

const AI_PROMPT = `你是虹忆坊需求收集师，一个专业的广告需求分析师。你的任务是通过结构化对话收集用户的产品信息、创作意图和广告规格要求。

## 工作流程

### 阶段1：项目启动与破冰
用户新建项目时，自动发送欢迎语：
"欢迎开启广告创作！我是您的需求分析师，接下来需要您提供一些关键信息，确保创作出符合您预期的广告作品。

⚠️ 重要提示：带有 * 号的为必填项，必须回答完成后才能进入创作阶段；其他问题可选择跳过。"

### 阶段2：必要信息锁定（逐个提问）
严格单次提问，确认有效后才进入下一题，不可跳过。

**问题1 - 广告类型 *（必填）**
- 提问："请选择本次创作的广告类型："
- 选项：🛍️ 产品广告 | 🏷️ 品牌广告 | 💰 促销广告

**问题2 - 产品描述 *（必填）**
- 提问："请描述您的产品名称、核心功能与卖点（建议50-200字，突出最关键的三个优势）："
- 验证：字数>10且包含实际产品功能描述
- 无效处理："您的描述似乎过于简单，请补充产品具体功能、使用场景或核心优势，帮助创意团队更好地理解产品。"

**问题3 - 产品图片 *（必填）**
- 提问："请上传产品高清图片（支持JPG/PNG，建议白底或场景图，用于视觉参考）："
- 用户可以通过上传按钮或文字描述

**问题4 - 广告故事类型 *（必填）**
- 提问："您希望广告采用什么叙事风格？"
- 选项：[不限] [科幻] [爱情] [悬疑] [恐怖] [动作] [喜剧] [战争] [西部] [奇幻] [歌舞] [冒险] [公路] [犯罪] [剧情]

### 阶段3：核心创意参数（批量收集）
必填项完成后，可批量收集创意细节：

- 产品植入比例：10%/25%/40%/50%
- 目标受众性别：男/女/不限
- 目标受众年龄段：儿童/青年/成年/老年/不限
- 时长：15s/30s/60s/90s/120s（默认30s）
- 画面比例：16:9横屏/9:16竖屏（默认9:16）
- 广告核心创作概念（一句话策略）
- 结尾情绪（希望用户看完的感受）
- 是否有旁白

### 阶段4：深度创意细节（可选）
- 产品调性关键词
- 主要场景设定
- 参考电影
- 角色名称和描述
- 必须包含的情节或镜头

### 阶段5：确认与交付
收集完成后，显示需求摘要卡片，包含：
- 必填项完成状态
- 产品描述摘要
- 广告类型和故事类型
- 创意设定（时长、比例、受众等）
- 确认按钮："确认并开始创作"

### 阶段6：转交创意总监
当用户确认后，向创意总监智能体发送结构化JSON，包含所有收集字段和必填项完成状态。

## 交互规则

1. **防重复**：维护已问问题列表，禁止重复询问
2. **无效答案识别**：检测答非所问、空白输入、格式错误
3. **情绪感知**：检测到用户负面情绪时，提供极简模式或建议休息
4. **智能默认**：画面比例默认9:16，时长默认30s，旁白默认否

## 重要约束

- 每轮只问一个问题，等用户回答后再问下一个
- 必填项未完成前，用户无法跳过
- 用户回答后，直接问下一个问题，不要说"好的"之类的话
- 不要重复问已收集的问题
- 用户回答后继续问下一个问题
- 只有当所有问题（必填+创意+可选）都收集完成，才能显示完成状态
- 收集完必填信息后，必须继续收集创意信息，不能提示完成
- 收集完创意信息后，可以继续收集可选信息或显示完成确认
- 不要在回复中添加进度提示，进度由系统统一显示`

const INITIAL_GREETING = `🎬 您好！我是虹忆坊的需求收集师

欢迎开启广告创作！我是您的需求分析师，接下来需要您提供一些关键信息，确保创作出符合您预期的广告作品。

⚠️ 重要提示：带有 * 号的为必填项，必须回答完成后才能进入创作阶段；其他问题可选择跳过。

---

**请选择本次创作的广告类型（必填）：**
🛍️ 产品广告
🏷️ 品牌广告
💰 促销广告`

export { INITIAL_GREETING }

// ============== MiniMax API Call ==============

async function callMiniMaxAPI(messages: MiniMaxMessage[]): Promise<string> {
  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + MINIMAX_API_KEY
    },
    body: JSON.stringify({
      model: MINIMAX_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 4096
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error('MiniMax API error: ' + response.status + ' - ' + errorText)
  }

  const data: MiniMaxResponse = await response.json()
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from MiniMax API')
  }

  return data.choices[0].message.content
}

// ============== Helper Functions ==============

export function getProgress(info: CollectedInfo): string {
  const requiredDone = REQUIRED_QUESTIONS.filter(q => info[q.key]).length
  const creativeDone = CREATIVE_QUESTIONS.filter(q => info[q.key]).length
  const optionalDone = OPTIONAL_QUESTIONS.filter(q => info[q.key]).length
  return `📊 进度：必要信息 ${requiredDone}/${REQUIRED_QUESTIONS.length} → 创意细节 ${creativeDone}/${CREATIVE_QUESTIONS.length} → 深度配置 ${optionalDone}/${OPTIONAL_QUESTIONS.length}`
}

// Strip progress from AI response to avoid duplication
function stripProgressFromResponse(response: string): string {
  return response.replace(/📊\s*进度[：:]\s*[^\n]*/gi, '').trim()
}

function extractCollectedInfo(conversationHistory: Array<{ role: 'user' | 'ai'; content: string }>, userMessage: string): CollectedInfo {
  const collected: CollectedInfo = {}
  const allText = conversationHistory.map(m => m.content).join(' ') + ' ' + userMessage

  // Extract ad type
  if (allText.includes('产品广告') || allText.includes('🛍️')) {
    collected.adType = '产品广告'
  } else if (allText.includes('品牌广告') || allText.includes('🏷️')) {
    collected.adType = '品牌广告'
  } else if (allText.includes('促销广告') || allText.includes('💰')) {
    collected.adType = '促销广告'
  }

  // Extract story type
  const storyTypes = ['不限', '科幻', '爱情', '悬疑', '恐怖', '动作', '喜剧', '战争', '西部', '奇幻', '歌舞', '冒险', '公路', '犯罪', '剧情']
  for (const type of storyTypes) {
    if (allText.includes(type)) {
      collected.storyType = type
      break
    }
  }

  // Extract product image
  if (allText.includes('上传') || allText.includes('图片') || allText.includes('照片') || allText.includes('有图片') || allText.includes('产品图')) {
    collected.productImage = '已提供'
  }

  // Extract duration
  if (allText.includes('15s')) collected.duration = '15s'
  else if (allText.includes('30s')) collected.duration = '30s'
  else if (allText.includes('60s')) collected.duration = '60s'
  else if (allText.includes('90s')) collected.duration = '90s'
  else if (allText.includes('120s')) collected.duration = '120s'

  // Extract aspect ratio
  if (allText.includes('16:9') || allText.includes('横屏')) collected.aspectRatio = '16:9'
  else if (allText.includes('9:16') || allText.includes('竖屏')) collected.aspectRatio = '9:16'

  // Extract target gender
  if (allText.includes('男') && !allText.includes('不限')) collected.targetGender = '男'
  else if (allText.includes('女') && !allText.includes('不限')) collected.targetGender = '女'
  else if (allText.includes('不限') && (allText.includes('性别') || allText.includes('受众'))) collected.targetGender = '不限'

  // Extract narrator
  if (allText.includes('有旁白') || (allText.includes('是') && allText.includes('旁白'))) collected.narrator = '是'
  else if (allText.includes('无旁白') || (allText.includes('否') && allText.includes('旁白'))) collected.narrator = '否'

  // Extract product description (long text)
  const longTexts = conversationHistory
    .filter(m => m.role === 'user' && m.content.length > 10)
    .map(m => m.content)
  if (longTexts.length > 0) {
    collected.productDescription = longTexts[longTexts.length - 1]
  }

  // Extract 植入比例
  if (allText.includes('10%') || allText.includes('10％')) collected['植入比例'] = '10%'
  else if (allText.includes('25%') || allText.includes('25％')) collected['植入比例'] = '25%'
  else if (allText.includes('40%') || allText.includes('40％')) collected['植入比例'] = '40%'
  else if (allText.includes('50%') || allText.includes('50％')) collected['植入比例'] = '50%'

  // Extract character name
  if (allText.includes('角色名称')) {
    const charMatch = allText.match(/角色名称[：:]\s*([^，,\n]+)/)
    if (charMatch) collected.characterName = charMatch[1].trim()
  }

  // Extract character description
  if (allText.includes('角色描述')) {
    const descMatch = allText.match(/角色描述[：:]\s*(.+?)(?=$|[\n])/)
    if (descMatch) collected.characterDesc = descMatch[1].trim()
  }

  // Extract story points
  if (allText.includes('情节') || allText.includes('镜头') || allText.includes('必须包含')) {
    const pointsMatch = userMessage.match(/情节[：:]\s*(.+?)$/i) || userMessage.match(/镜头[：:]\s*(.+?)$/i)
    if (pointsMatch) collected.storyPoints = pointsMatch[1].trim()
  }

  return collected
}

// ============== Main Generation Function ==============

export async function generateAIResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'ai'; content: string; agent?: AIAgentType }>,
  uploadedFiles?: Array<{ type: 'image' | 'document'; name: string; preview: string }>
): Promise<{
  response: string
  canvasData?: GeneratedContent
  stage: 'collecting' | 'ready_to_create' | 'story' | 'script' | 'complete'
  collectedInfo?: CollectedInfo
  agent?: AIAgentType
}> {
  // First message - show welcome and first question
  if (conversationHistory.length === 0) {
    return {
      response: INITIAL_GREETING + '\n\n' + getProgress({}),
      stage: 'collecting',
      agent: 'requirements_collector'
    }
  }

  // Build messages for MiniMax API
  const messages: MiniMaxMessage[] = [
    { role: 'system', content: AI_PROMPT }
  ]

  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.content
    })
  }

  // Add uploaded files context
  if (uploadedFiles && uploadedFiles.length > 0) {
    const fileDescriptions = uploadedFiles.map(f => {
      if (f.type === 'image') return '[图片: ' + f.name + ']'
      if (f.type === 'document') return '[文档: ' + f.name + ']'
      return ''
    }).join(', ')
    messages.push({
      role: 'user',
      content: '用户上传了文件：' + fileDescriptions
    })
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage
  })

  try {
    const aiResponse = await callMiniMaxAPI(messages)

    // Parse collected info from conversation
    const collected = extractCollectedInfo(
      conversationHistory.filter(m => m.role === 'user' || m.role === 'ai'),
      userMessage
    )

    // Update productImage if user uploaded in current message
    if (uploadedFiles && uploadedFiles.some(f => f.type === 'image')) {
      collected.productImage = '已提供'
    }

    // Check completion status
    const requiredDone = REQUIRED_QUESTIONS.filter(q => collected[q.key]).length
    const requiredComplete = requiredDone === REQUIRED_QUESTIONS.length
    
    const creativeDone = CREATIVE_QUESTIONS.filter(q => collected[q.key]).length
    const creativeComplete = creativeDone === CREATIVE_QUESTIONS.length
    
    const optionalDone = OPTIONAL_QUESTIONS.filter(q => collected[q.key]).length
    const optionalComplete = optionalDone === OPTIONAL_QUESTIONS.length

    // Only show complete when ALL questions are answered
    if (requiredComplete && creativeComplete && optionalComplete) {
      const summary = `
📋 需求确认清单

【必填项】✅ 已完成
• 广告类型：${collected.adType || '未选择'}
• 产品描述：${collected.productDescription ? (collected.productDescription.slice(0, 50) + '...') : '未提供'}
• 产品图片：${collected.productImage || '未上传'}
• 故事类型：${collected.storyType || '未选择'}

【创意设定】✅ 已完成
• 植入比例：${collected['植入比例'] || '默认25%'}
• 目标受众：${collected.targetGender || '不限'}，${collected.targetAge || '不限'}
• 时长：${collected.duration || '默认30s'}
• 画面比例：${collected.aspectRatio || '默认9:16'}
• 核心概念：${collected.concept || '未提供'}
• 结尾情绪：${collected.emotion || '未提供'}
• 旁白：${collected.narrator || '否'}

【深度配置】✅ 已完成
• 调性关键词：${collected.toneKeywords || '未提供'}
• 场景设定：${collected.sceneSetting || '未提供'}
• 参考电影：${collected.referenceMovies || '未提供'}
• 角色名称：${collected.characterName || '未提供'}
• 角色描述：${collected.characterDesc || '未提供'}
• 故事要点：${collected.storyPoints || '未提供'}

[修改需求] [确认并开始创作]`

      return {
        response: stripProgressFromResponse(aiResponse) + summary,
        stage: 'complete',
        collectedInfo: collected,
        agent: 'requirements_collector'
      }
    }

    // Required info not complete - continue collecting
    if (!requiredComplete) {
      return {
        response: stripProgressFromResponse(aiResponse) + '\n\n' + getProgress(collected),
        stage: 'collecting',
        collectedInfo: collected,
        agent: 'requirements_collector'
      }
    }

    // Required info complete - continue collecting creative info
    if (requiredComplete && !creativeComplete) {
      return {
        response: stripProgressFromResponse(aiResponse) + '\n\n✅ 必填信息已收集完成！让我们继续完善创意细节。\n\n' + getProgress(collected),
        stage: 'collecting',
        collectedInfo: collected,
        agent: 'requirements_collector'
      }
    }

    // Creative info complete - continue collecting optional info
    if (requiredComplete && creativeComplete && !optionalComplete) {
      return {
        response: stripProgressFromResponse(aiResponse) + '\n\n✅ 创意细节已收集完成！最后完善一些可选细节（可跳过）。\n\n' + getProgress(collected),
        stage: 'collecting',
        collectedInfo: collected,
        agent: 'requirements_collector'
      }
    }

    // Default - continue collecting
    return {
      response: stripProgressFromResponse(aiResponse) + '\n\n' + getProgress(collected),
      stage: 'collecting',
      collectedInfo: collected,
      agent: 'requirements_collector'
    }

  } catch (error) {
    console.error('MiniMax API error:', error)
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    const isImageError = 
      errorMessage.includes('image') || 
      errorMessage.includes('Image') ||
      errorMessage.includes('vision') ||
      errorMessage.includes('picture') ||
      errorMessage.includes('photo') ||
      errorMessage.includes('upload')
    
    let userErrorMessage = '抱歉，请再说一次。'
    
    if (isImageError) {
      userErrorMessage = '抱歉，当前版本暂不支持图片输入。请您通过文字描述产品信息，我会记录您已上传图片，稍后处理。'
    }
    
    return {
      response: userErrorMessage + '\n\n' + getProgress({}),
      stage: 'collecting',
      agent: 'requirements_collector'
    }
  }
}

export function formatResponseForDisplay(response: string): string {
  return response
    .replace(/## /g, '\n🎬 ')
    .replace(/### /g, '\n✨ ')
    .replace(/\*\*/g, '')
    .replace(/\n\n/g, '\n')
}
