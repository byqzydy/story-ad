/**
 * Jiaobeng Skill - 广告剧本创作助手
 * 
 * 功能：接收广告创作页面的各类创作信息，调用大模型生成广告剧本
 * 
 * 输入参数：
 * - adCoreConcept: 广告核心创作概念
 * - adEndingEmotion: 广告结尾希望表达的情绪  
 * - storyPrompt: 广告故事要点
 * - productName: 产品名称
 * - productTone: 产品调性
 * - productDescription: 产品描述
 * - characterNames: 角色名称列表
 * - characterDescriptions: 角色描述列表
 * - scene: 场景
 * - visualStyle: 视觉风格
 * - duration: 时长
 * - audienceGender: 目标受众性别
 * - audienceAge: 目标受众年龄段
 * 
 * 输出：
 * - 返回生成的广告剧本内容
 */

export interface JiaobengInput {
  adCoreConcept: string        // 广告核心创作概念
  adEndingEmotion: string      // 广告结尾希望表达的情绪
  storyPrompt: string         // 广告故事要点
  productName: string         // 产品名称
  productTone: string         // 产品调性
  productDescription: string  // 产品描述
  characterNames: string[]    // 角色名称列表
  characterDescriptions: string[]  // 角色描述列表
  scene: string              // 场景
  visualStyle: string        // 视觉风格
  duration: string           // 时长
  audienceGender: string    // 目标受众性别
  audienceAge: string       // 目标受众年龄段
}

export interface JiaobengOutput {
  script: string             // 生成的广告剧本
  success: boolean           // 是否成功
  error?: string            // 错误信息
}

/**
 * 生成广告剧本的提示词
 */
function buildPrompt(input: JiaobengInput): string {
  const { 
    adCoreConcept, 
    adEndingEmotion, 
    storyPrompt, 
    productName, 
    productTone, 
    productDescription,
    characterNames,
    characterDescriptions,
    scene,
    visualStyle,
    duration,
    audienceGender,
    audienceAge
  } = input

  // 构建角色描述
  let charactersInfo = ''
  if (characterNames && characterNames.length > 0) {
    charactersInfo = characterNames.map((name, index) => {
      const desc = characterDescriptions?.[index] || ''
      return `- ${name}: ${desc || '未描述'}`
    }).join('\n')
  }

  return `你是一位专业的广告剧本创作大师。请根据以下信息创作一个广告剧本。

## 创作要求

### 1. 产品信息
- 产品名称: ${productName || '未指定'}
- 产品调性: ${productTone || '未指定'}
- 产品描述: ${productDescription || '未描述'}

### 2. 创作概念
- 核心创作概念: ${adCoreConcept || '未指定'}
- 结尾情绪: ${adEndingEmotion || '未指定'}
- 故事要点: ${storyPrompt || '未指定'}

### 3. 角色信息
${charactersInfo || '无角色信息'}

### 4. 场景与风格
- 场景: ${scene || '不限'}
- 视觉风格: ${visualStyle || '动画'}

### 5. 目标受众
- 性别: ${audienceGender || '不限'}
- 年龄段: ${audienceAge || '不限'}

### 6. 时长要求
${duration || '30s'}

## 输出要求

请创作一个完整的广告剧本，要求：
1. 紧扣核心创作概念
2. 合理运用角色和场景
3. 结尾情绪与设定相符
4. 语言生动、画面感强
5. 适合产品调性和目标受众

请直接输出剧本内容，不要包含其他说明文字。剧本长度控制在适合${duration || '30s'}视频拍摄。`
}

/**
 * Jiaobeng 主要函数 - 生成广告剧本
 */
export async function generateAdScript(
  input: JiaobengInput,
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
  }
): Promise<JiaobengOutput> {
  const { 
    model = 'minimax-m2.5',
    temperature = 0.8,
    maxTokens = 2000
  } = options || {}

  try {
    const prompt = buildPrompt(input)
    
    // 这里需要调用实际的 API
    // 示例调用方式（需要根据实际 API 调整）：
    // const response = await fetch('/api/ai/generate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     model,
    //     messages: [{ role: 'user', content: prompt }],
    //     temperature,
    //     max_tokens: maxTokens
    //   })
    // })
    
    // 模拟 API 调用（实际使用时替换为真实 API）
    const mockResponse = await mockApiCall(prompt)
    
    return {
      script: mockResponse,
      success: true
    }
  } catch (error) {
    return {
      script: '',
      success: false,
      error: error instanceof Error ? error.message : '生成剧本时发生错误'
    }
  }
}

/**
 * 模拟 API 调用（开发调试用）
 * 实际使用时替换为真实 API 调用
 */
async function mockApiCall(prompt: string): Promise<string> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 根据产品信息生成一个模拟剧本
  const productName = prompt.includes('产品名称:') 
    ? prompt.match(/产品名称: (.+)/)?.[1] || '产品'
    : '产品'
  
  const scene = prompt.includes('场景:')
    ? prompt.match(/场景: (.+)/)?.[1] || '都市'
    : '都市'
  
  const duration = prompt.includes('时长要求:')
    ? prompt.match(/时长要求: (.+)/)?.[1] || '30s'
    : '30s'
  
  return `【${productName}广告剧本】

【场景】${scene}

【开场】
清晨的阳光洒落在${scene}，镜头缓缓推进...

【情节发展】
主人公在使用${productName}的过程中，展示了产品的核心功能和特点。通过日常生活场景的展示，让观众产生共鸣。

【高潮】
产品解决了主人公的痛点，带来惊喜和便利。

【结尾】
温暖有力的收尾，强调品牌理念，留下深刻印象。

【旁白】
（根据设定添加适当旁白）

---
*本剧本根据核心概念"${prompt.includes('核心创作概念:') ? prompt.match(/核心创作概念: (.+)/)?.[1] || '未指定' : '未指定'}"创作*`
}

/**
 * 导出技能元数据
 */
export const jiaobengSkill = {
  name: 'Jiaobeng',
  description: '广告剧本创作助手 - 根据广告创作信息生成专业广告剧本',
  version: '1.0.0',
  input: {} as JiaobengInput,
  output: {} as JiaobengOutput,
  generate: generateAdScript
}

export default jiaobengSkill
