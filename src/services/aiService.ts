/**
 * AI Service for 虹忆坊智能代理
 * MiniMax M2.5 API implementation
 * 
 * Sci-Fi Cinematic Ad Architect Pro skill
 * Only supports sci-fi advertising creation
 */

// ============== Configuration ==============

const MINIMAX_API_KEY = 'sk-cp-Hdpam27OvKPbjs7qUEB93_-mFSXB-ygC6wBcGuKJVCyD0AUSgzAYDt7t218wGW-1MkFLYXpDzvkIYpTv98kYbAefcp16tigaD78zubr8GkpaP5LgeZGZrl8'
const MINIMAX_MODEL = 'MiniMax-M2.5'
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2'

// ============== Types ==============

interface ProjectInfo {
  // Required
  hasProductImage: boolean    // 产品图片 (required - need upload)
  
  // Optional
  productDescription?: string  // 产品描述
  adType?: string           // 广告类型
  coreConcept?: string       // 广告核心创作概念（不超过30字）
  endingEmotion?: string    // 广告结尾希望表达的情绪
  storyPoints?: string       // 广告故事要点
  productName?: string       // 产品名称
  productTone?: string       // 产品调性关键词
  characterName?: string     // 角色名称
  characterDesc?: string     // 角色描述
  moviePrototype?: string     // 要融合的电影类型（默认科幻）
  referenceMovie?: string    // 参考电影
  mainScene?: string         // 主要场景
  visualStyle?: string       // 视觉风格
  duration?: string         // 时长
  aspectRatio?: string       // 画面比例
  hasNarration?: boolean    // 是否有旁白（默认否）
  productPlacement?: number  // 产品植入比例
  targetGender?: string     // 目标受众性别
  targetAge?: string[]       // 目标受众年龄段
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

// ============== Skill System Prompt ==============

const SKILL_SYSTEM_PROMPT = `你是虹忆坊智能广告代理 - Sci-Fi Cinematic Ad Architect Pro

## 你的身份
你是一位顶级科幻电影广告创意总监，专门创作**科幻风格**的广告内容。

## 核心能力
1. **概念引擎**: 三层概念架构（哲学/冲突/隐喻）
2. **原型匹配**: 电影原型融合策略（银翼杀手/星际穿越/机械姬/黑客帝国等）
3. **角色引擎**: 2-4人关系网络 + 完整弧光
4. **叙事架构**: 三幕剧 + 多版本时长（15s/30s/60s/90s/120s）
5. **电影语言**: 分镜+运镜+色彩+声音
6. **产品融合**: 零硬广感，100%剧情化

## 重要限制
**你只支持科幻（Sci-Fi）类型的广告创作！**

如果用户请求其他类型（爱情、喜剧、动作、恐怖、悬疑等），请礼貌地说明：
"抱歉，我目前只支持科幻类型的广告创作。不过，我可以帮您将产品包装成科幻风格，比如将您的产品置于未来世界，外星文明，时间旅行、人工智能等科幻背景下。请问您愿意尝试科幻风格吗？"

## 需要收集的信息

### 必填信息（必须收集完整才能开始创作）
1. **产品图片** - 必须上传产品图片

### 可选信息（收集后可开始创作，也可继续询问）
2. 产品描述 - 产品的功能、特点、卖点
3. 产品名称
4. 产品调性关键词
5. 广告类型
6. 广告核心创作概念（不超过30字）
7. 广告结尾希望表达的情绪
8. 广告故事要点
9. 角色名称
10. 角色描述
11. 参考电影
12. 主要场景
13. 视觉风格：[赛博朋克/极简人文/史诗太空/生物机械/故障艺术等]
14. 时长：[15s/30s/60s/90s/120s]
15. 画面比例：[16:9 / 9:16]
16. 是否有旁白：[是/否]，默认否
17. 产品植入比例：[10-50]%
18. 目标受众性别：[男/女/不限]
19. 目标受众年龄段（可多选）：[儿童/青年/成年/老年/不限]

## 信息收集流程

1. **第一步**：提醒上传产品图片
   - 必须提醒上传产品图片
   
2. **第二步**：必填信息收集完成后
   - 可以询问用户是否要补充可选信息
   - 或者询问"是否开始创作？"
   
3. **第三步**：用户确认开始创作后
   - 生成故事大纲
   - 生成分镜脚本

## 沟通风格
- 使用专业但友好的语气
- 使用emoji增加可读性
- 主动引导用户完成信息采集
- 必填信息未收集完整时，必须提醒用户补充
- 收集完必填信息后，可以提示可选信息或询问是否开始创作

## 电影原型参考
- 银翼杀手 (Blade Runner) - 赛博朋克、黑暗未来
- 机械姬 (Ex Machina) - AI、人工智能
- 黑客帝国 (The Matrix) - 虚拟现实、哲学
- 星际穿越 (Interstellar) - 太空、亲情、虫洞
- 她 (Her) - AI爱情、孤独
- 盗梦空间 (Inception) - 梦境、潜意识
- 疯狂的麦克斯 (Mad Max) - 末日、废土
- 降临 (Arrival) - 外星语言，时间`

const INITIAL_GREETING = `🎬 您好！我是虹忆坊智能广告代理

作为 **Sci-Fi Cinematic Ad Architect Pro**，我将帮助您创作**科幻风格**的电影级广告。

⚠️ **温馨提示**：目前我只支持科幻类型的广告创作，暂不支持其他风格。

---

**在开始创作之前，我需要收集一些信息：**

### ⭐ 必填信息（请务必提供）
🖼️ **产品图片** - 请上传产品图片（必须）

### 可选信息（可以补充会让创作更精准）
- 产品描述、产品名称、产品调性关键词
- 视觉风格：[赛博朋克/极简人文/史诗太空/生物机械/故障艺术]
- 时长：[15s/30s/60s/90s/120s]
- 画面比例：[16:9 / 9:16]
- 参考电影、角色信息、目标受众等

---

请先**上传产品图片**，然后告诉我您的创意想法，我就可以开始为您创作科幻广告了！🎥`

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

// ============== Info Extraction ==============

/**
 * Extract project info from conversation
 */
function extractProjectInfo(messages: Array<{ role: 'user' | 'ai'; content: string }>, currentMessage?: string): Partial<ProjectInfo> {
  const info: Partial<ProjectInfo> = {}
  const allContent = messages.map(m => m.content).join('\n') + (currentMessage ? '\n' + currentMessage : '')

  // Check if user mentioned they uploaded image
  if (allContent.match(/上传|图片|照片|image|photo|截图|照片/i)) {
    info.hasProductImage = true
  }

  // Optional: Product description
  const descMatch = allContent.match(/(?:产品描述|产品介绍|产品功能|产品特点|卖点|功能介绍)[：:](.+?)(?:\n|$)/i)
  if (descMatch) {
    info.productDescription = descMatch[1].trim()
  }

  // Optional: Product name
  const nameMatch = allContent.match(/(?:产品名称|品牌名|产品名)[：:](.+?)(?:\n|$)/i)
  if (nameMatch) info.productName = nameMatch[1].trim()

  // Optional: Product tone
  const toneMatch = allContent.match(/(?:产品调性|调性|风格关键词)[：:](.+?)(?:\n|$)/i)
  if (toneMatch) info.productTone = toneMatch[1].trim()

  // Optional: Core concept
  const conceptMatch = allContent.match(/(?:核心创作概念|创作概念|概念)[：:](.{1,30}?)(?:\n|$)/i)
  if (conceptMatch) info.coreConcept = conceptMatch[1].trim()

  // Optional: Duration
  const durationMatch = allContent.match(/时长[:\s]*(\d+s)/i)
  if (durationMatch) info.duration = durationMatch[1]

  // Optional: Visual style
  const styleMatch = allContent.match(/(?:视觉风格|风格)[：:]*(赛博朋克|极简人文|史诗太空|生物机械|故障艺术)/i)
  if (styleMatch) info.visualStyle = styleMatch[1]

  // Optional: Aspect ratio
  if (allContent.match(/16:9|横屏|横版/i)) info.aspectRatio = '16:9'
  else if (allContent.match(/9:16|竖屏|竖版/i)) info.aspectRatio = '9:16'

  // Optional: Narration
  if (allContent.match(/有旁白|需要旁白|是/i) && allContent.match(/旁白/i)) {
    info.hasNarration = true
  } else if (allContent.match(/无旁白|不需要旁白|否/i) && allContent.match(/旁白/i)) {
    info.hasNarration = false
  }

  // Optional: Target gender
  if (allContent.match(/目标.*男/i)) info.targetGender = '男'
  else if (allContent.match(/目标.*女/i)) info.targetGender = '女'
  else if (allContent.match(/目标.*不限/i)) info.targetGender = '不限'

  // Optional: Target age
  const ages: string[] = []
  if (allContent.match(/儿童|小孩|孩子/i)) ages.push('儿童')
  if (allContent.match(/青年|年轻人/i)) ages.push('青年')
  if (allContent.match(/成年|成年人/i)) ages.push('成年')
  if (allContent.match(/老年|老人|中老年/i)) ages.push('老年')
  if (allContent.match(/不限|全年龄/i)) ages.push('不限')
  if (ages.length > 0) info.targetAge = ages

  return info
}

/**
 * Check if required info is collected
 * Only product image is required now
 */
function isRequiredInfoComplete(info: Partial<ProjectInfo>): boolean {
  return !!info.hasProductImage
}

/**
 * Generate info collection prompt based on what's missing
 */
function generateInfoCollectionPrompt(info: Partial<ProjectInfo>): string {
  // Only product image is required
  if (!info.hasProductImage) {
    return '\n🔍 为了更好地为您创作科幻广告，请补充以下信息：\n\n🖼️ 请**上传产品图片**，这是创作的必要素材\n\n---\n\n💡 提供的信息越多，创作越精准！\n'
  }

  // Product image uploaded, show optional info prompt
  let result = '\n✅ **基本素材已收集！**\n\n您已提供：\n- 产品图片：已上传 ✓\n'
  if (info.productDescription) {
    result += '- 产品描述：' + info.productDescription.slice(0, 30) + '...\n'
  }

  result += '\n---\n\n**下一步，您可以：**\n\n1. 补充更多可选信息（让创作更精准）：\n   - 视觉风格：[赛博朋克/极简人文/史诗太空/生物机械/故障艺术]\n   - 时长：[15s/30s/60s/90s/120s]\n   - 产品描述、参考电影、角色信息、目标受众等\n\n2. 或者直接告诉我「**开始创作**」，我将为您生成故事大纲和分镜脚本！\n\n🎬 期待为您打造科幻级广告大片！\n'

  return result
}

// ============== Main Generation Function ==============

export async function generateAIResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'ai'; content: string }>,
  uploadedFiles?: Array<{ type: 'image' | 'document'; name: string; preview: string }>
): Promise<{
  response: string
  canvasData?: GeneratedContent
  stage: 'collecting' | 'ready_to_create' | 'story' | 'script' | 'complete'
}> {
  // Check if user is just starting
  if (conversationHistory.length === 0) {
    return {
      response: INITIAL_GREETING,
      stage: 'collecting'
    }
  }

  // Check for non-sci-fi genre requests
  const nonSciFiKeywords = ['爱情片', '喜剧', '动作片', '恐怖片', '悬疑', '惊悚', '动画片', '文艺片', '战争片', '爱情电影', '浪漫', '爱情', '搞笑', '动作', '恐怖']
  const isNonSciFi = nonSciFiKeywords.some(function(keyword) { return userMessage.indexOf(keyword) !== -1 })
  
  if (isNonSciFi && userMessage.indexOf('科幻') === -1 && userMessage.indexOf('未来') === -1) {
    return {
      response: '抱歉，我目前只支持**科幻类型**的广告创作。\n\n我可以将您的产品包装成科幻风格，例如：\n- 🌌 未来世界背景\n- 🤖 人工智能/机器人主题\n- 🛸 外星文明/星际探索\n- ⏰ 时间旅行/平行宇宙\n- 🔮 赛博朋克/虚拟现实\n\n请问您愿意尝试**科幻风格**吗？请告诉我您的产品信息和科幻创想，我可以为您创作！',
      stage: 'collecting'
    }
  }

  // Check if user uploaded image in current message
  const hasImageInCurrent = uploadedFiles && uploadedFiles.some(function(f) { return f.type === 'image' })

  // Extract project info
  let projectInfo = extractProjectInfo(conversationHistory, userMessage)
  
  // Update hasProductImage if user uploaded in current message
  if (hasImageInCurrent) {
    projectInfo.hasProductImage = true
  }

  // Build messages for MiniMax API
  const messages: MiniMaxMessage[] = [
    { role: 'system', content: SKILL_SYSTEM_PROMPT }
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
    const fileDescriptions = uploadedFiles.map(function(f) {
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
    // Check if user wants to start creating
    const wantsToCreate = userMessage.indexOf('开始创作') !== -1 || userMessage.indexOf('开始生成') !== -1 || userMessage.indexOf('生成脚本') !== -1 || userMessage.indexOf('创作') !== -1

    // If user wants to create but required info not complete
    if (wantsToCreate && !isRequiredInfoComplete(projectInfo)) {
      return {
        response: generateInfoCollectionPrompt(projectInfo),
        stage: 'collecting'
      }
    }

    // If user wants to create and required info is complete
    if (wantsToCreate && isRequiredInfoComplete(projectInfo)) {
      // Call API to generate content
      let prompt = '基于以下产品信息，生成科幻电影风格的广告故事大纲和分镜脚本：\n\n'
      prompt += '产品描述：' + (projectInfo.productDescription || '未提供') + '\n'
      prompt += '产品名称：' + (projectInfo.productName || '未命名') + '\n'
      prompt += '视觉风格：' + (projectInfo.visualStyle || '赛博朋克') + '\n'
      prompt += '时长：' + (projectInfo.duration || '60s') + '\n'
      prompt += '画面比例：' + (projectInfo.aspectRatio || '16:9') + '\n'
      if (projectInfo.coreConcept) {
        prompt += '核心概念：' + projectInfo.coreConcept + '\n'
      }
      if (projectInfo.targetGender) {
        prompt += '目标受众：' + projectInfo.targetGender + '\n'
      }
      if (projectInfo.targetAge) {
        prompt += '年龄段：' + projectInfo.targetAge.join('、') + '\n'
      }

      prompt += '\n请按照以下格式输出：\n1. 故事大纲（三幕结构）\n2. 分镜脚本（至少6个镜头，包含景别、运镜、画面描述，对白/声音）'

      const creativeMessages = messages.slice()
      creativeMessages.push({ role: 'user', content: prompt })
      
      const aiResponse = await callMiniMaxAPI(creativeMessages)

      return {
        response: aiResponse,
        canvasData: {
          storyOutline: aiResponse,
          script: [],
          visualStatus: 'pending'
        },
        stage: 'story'
      }
    }

    // Check if required info is complete
    if (!isRequiredInfoComplete(projectInfo)) {
      return {
        response: generateInfoCollectionPrompt(projectInfo),
        stage: 'collecting'
      }
    }

    // Required info complete - provide next steps
    return {
      response: generateInfoCollectionPrompt(projectInfo),
      stage: 'ready_to_create'
    }

  } catch (error) {
    console.error('MiniMax API error:', error)
    
    return {
      response: '抱歉，我遇到了一些技术问题。请稍后再试。\n\n如果问题持续，请尝试刷新页面重新开始对话。',
      stage: 'collecting'
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
