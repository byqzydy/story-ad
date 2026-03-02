/**
 * Script Generator Service for Movie Placement
 * 
 * Features:
 * - Web search for movie info
 * - Generate professional scripts with product placement
 * - Fan fiction style that integrates products naturally into classic movie scenes
 */

import type { MovieInfo } from './movieService';
export type { MovieInfo };

const MINIMAX_API_KEY = 'sk-cp-Hdpam27OvKPbjs7qUEB93_-mFSXB-ygC6wBcGuKJVCyD0AUSgzAYDt7t218wGW-1MkFLYXpDzvkIYpTv98kYbAefcp16tigaD78zubr8GkpaP5LgeZGZrl8'
const MINIMAX_MODEL = 'MiniMax-M2.5'
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2'

interface ProductInfo {
  name: string
  description: string
  images: string[]
  logo: string
}

interface GenerateScriptParams {
  productInfo: ProductInfo
  movieInfo: MovieInfo
  duration: string
  aspectRatio: string
}

interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

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
      temperature: 0.8,
      max_tokens: 8000
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error('MiniMax API error: ' + response.status + ' - ' + errorText)
  }

  const data = await response.json()
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from MiniMax API')
  }

  return data.choices[0].message.content
}

/**
 * Build system prompt for professional script generation
 */
function buildSystemPrompt(): string {
  return `你是虹忆坊专业编剧AI，专门创作电影产品植入同人剧本。

## 你的任务
根据提供的电影信息和产品信息，创作一个专业的同人演绎剧本，让产品广告无缝融入经典电影桥段。

## 剧本要求（必须严格遵守）
1. **植入自然** - 产品必须像原生剧情一样自然出现，不能生硬植入广告
2. **广告出镜** - 产品必须在剧本中出镜至少1次
3. **功能体现** - 产品功能和特色必须通过人物行为和对话自然展现
4. **人物描写** - 剧本中需要包含详细的人物动作、表情、场景描写，特别是人物的服装、容貌、配饰等外貌描写
5. **一致性** - 保证相同人物与场景在整个剧本中的一致性

## 输出格式（必须使用此格式）
【剧名】《电影名》同人广告剧本

【产品】产品名称

【时长】XX秒

【画幅】XX

【剧本】
【场景1】场景标题 (时间范围)
【时间】：XX:XX-XX:XX
【地点】：具体场景地点
【人物】：出场人物
【人物描写】：详细描写人物的服装、容貌、发型、配饰、表情等外貌特征，包括服装颜色、款式、鞋子、发型、面部特征等
【画面描述】：详细描述画面内容、人物动作、表情、场景氛围，以及产品如何自然出现在场景中展现产品功能
【对话/独白】：
人物A：对话内容1
人物B：对话内容2

【场景2】...

【场景N】...

【广告词】（可选）产品广告语或标语

## 重要提示
- 选择电影中最经典的桥段进行改编
- 产品出现要符合场景逻辑，不要有单独的"产品展示"部分
- 对话要符合人物性格
- 人物外貌描写要详细具体，包括服装颜色、款式、发型、配饰等
- 请直接输出完整剧本，不要添加其他解释`
}

/**
 * Build user prompt with movie and product info
 */
function buildUserPrompt(params: GenerateScriptParams): string {
  const { productInfo, movieInfo, duration, aspectRatio } = params
  
  return `## 电影信息
- 电影名称：${movieInfo.name}
- 导演：${movieInfo.director}
- 年份：${movieInfo.year}
- 类型：${movieInfo.genre}

## 电影简介（3000字大纲）
${movieInfo.synopsis}

## 经典角色介绍
${movieInfo.characters.map((c, i) => (i + 1) + '. ' + c).join('\n')}

## 经典桥段/名场面
${movieInfo.scenes.map((s, i) => (i + 1) + '. ' + s).join('\n')}

## 产品信息
- 产品名称：${productInfo.name}
- 产品描述/特点：${productInfo.description}

## 创作要求
- 视频时长：${duration}秒
- 画幅比例：${aspectRatio}
- 请选择一个最经典的桥段进行改编
- 将产品自然融入剧情，让观众不会感觉到是广告

## 请生成专业的产品植入同人剧本：`
}

/**
 * Generate fallback script when API fails
 */
export function generateFallbackScript(params: GenerateScriptParams): string {
  const { productInfo, movieInfo, duration } = params
  const durationNum = parseInt(duration)
  const sceneCount = durationNum <= 30 ? 3 : 4
  
  let script = `【剧名】《${movieInfo.name}》同人广告剧本

【产品】${productInfo.name}

【时长】${duration}秒

【画幅】16:9

【剧本】
`
  
  const scenes = movieInfo.scenes.slice(0, sceneCount)
  const timePerScene = Math.floor(durationNum / sceneCount)
  
  scenes.forEach((scene, index) => {
    const startTime = index * timePerScene
    const endTime = (index + 1) * timePerScene
    
    script += `【场景${index + 1}】${scene} (${startTime}-${endTime}秒)
【时间】：00:${startTime.toString().padStart(2, '0')}-00:${endTime.toString().padStart(2, '0')}
【地点】：${movieInfo.name}经典场景地
【人物】：${movieInfo.characters[0] || '主角'}
【人物描写】：${movieInfo.characters[0] || '主角'}身着经典造型，展现电影中的标志性外观
【画面描述】：延续《${movieInfo.name}》中的经典场景风格，${scene}的经典画面重新呈现
【对话/独白】：
${movieInfo.characters[0]?.split('-')[0] || '角色'}：${productInfo.name}让这一刻更加完美...

`
  })
  
  script += `\n【广告词】${productInfo.name}，${productInfo.description}`

  return script
}

// Simple API for MoviePlacement page
import { getMovieInfo } from './movieService';

export interface SimpleGenerateParams {
  productName: string
  productDescription: string
  productImages: string[]
  movieName: string
  movieType: string
  duration: number
  aspectRatio?: string
}

export interface ScriptGenerationResult {
  script: string
  movieInfo: MovieInfo
  process: {
    step1: string  // 收集用户信息
    step2: string  // 查找电影
    step3: string  // 故事简介
    step4: string  // 经典角色
    step5: string  // 经典桥段
    step6: string  // 剧本创作
    step7: string  // 输出格式
  }
}

/**
 * Generate script with full process information
 */
export async function generateScript(params: SimpleGenerateParams): Promise<ScriptGenerationResult> {
  const { 
    productName, 
    productDescription, 
    productImages, 
    movieName, 
    duration,
    aspectRatio = '16:9'
  } = params
  
  // Step 1: Collect user info
  const step1Info = `产品名称: ${productName}, 产品描述: ${productDescription}, 产品图片: ${productImages.length}张, 广告时长: ${duration}秒`
  
  // Step 2: Search movie
  const movieInfo = await getMovieInfo(movieName)
  const step2Info = `正在搜索电影: ${movieName}... 已找到《${movieInfo.name}》(${movieInfo.year})`
  
  // Step 3: Movie synopsis
  const step3Info = `已获取电影故事简介: ${movieInfo.synopsis.substring(0, 100)}... (共${movieInfo.synopsis.length}字)`
  
  // Step 4: Characters
  const step4Info = `已获取经典角色: ${movieInfo.characters.join(', ')}`
  
  // Step 5: Classic scenes
  const step5Info = `已获取经典桥段: ${movieInfo.scenes.join(', ')}`
  
  // Step 6: Generate script
  const productInfo: ProductInfo = {
    name: productName,
    description: productDescription,
    images: productImages,
    logo: ''
  }
  
  let script: string
  
  try {
    script = await generateScriptWithAPI({
      productInfo,
      movieInfo,
      duration: duration.toString(),
      aspectRatio
    })
    const step6Info = `正在结合电影故事和经典桥段创作同人剧本...`
    const step7Info = `剧本生成完成，共${script.length}字符`
    
    return {
      script,
      movieInfo,
      process: {
        step1: `✅ 步骤1: 收集用户信息 - ${step1Info}`,
        step2: `✅ 步骤2: 查找电影 - ${step2Info}`,
        step3: `✅ 步骤3: 获取故事简介 - ${step3Info}`,
        step4: `✅ 步骤4: 分析经典角色 - ${step4Info}`,
        step5: `✅ 步骤5: 提取经典桥段 - ${step5Info}`,
        step6: `✅ 步骤6: 创作同人剧本 - ${step6Info}`,
        step7: `✅ 步骤7: 输出专业格式 - ${step7Info}`
      }
    }
  } catch (error) {
    console.error('Script generation failed, using fallback:', error)
    script = generateFallbackScript({
      productInfo,
      movieInfo,
      duration: duration.toString(),
      aspectRatio
    })
    
    return {
      script,
      movieInfo,
      process: {
        step1: `✅ 步骤1: 收集用户信息 - ${step1Info}`,
        step2: `✅ 步骤2: 查找电影 - ${step2Info}`,
        step3: `✅ 步骤3: 获取故事简介 - ${step3Info}`,
        step4: `✅ 步骤4: 分析经典角色 - ${step4Info}`,
        step5: `✅ 步骤5: 提取经典桥段 - ${step5Info}`,
        step6: `⚠️ 步骤6: AI生成失败，使用备用方案`,
        step7: `✅ 步骤7: 剧本生成完成`
      }
    }
  }
}

/**
 * Generate script using MiniMax API
 */
async function generateScriptWithAPI(params: GenerateScriptParams): Promise<string> {
  const messages: MiniMaxMessage[] = [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: buildUserPrompt(params) }
  ]
  
  const script = await callMiniMaxAPI(messages)
  return script
}
