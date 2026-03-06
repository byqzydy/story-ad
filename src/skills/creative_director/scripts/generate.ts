/**
 * 创意生成脚本
 * 用于生成广告创意方案
 */

export interface CreativeInput {
  productName: string
  productDescription: string
  adType: string
  storyType: string
  duration: string
  aspectRatio: string
  targetAudience?: string
  tone?: string
}

export interface CreativeOutput {
  coreConcept: string
  storyOutline: string
  storyboard: string
  visualStyle: string
  colorPalette: string
  musicRecommendation: string
}

export function generateCoreConcept(input: CreativeInput): string {
  const concepts: Record<string, string[]> = {
    '产品广告': [
      `让${input.productName}成为你生活中的不可或缺的一部分`,
      `${input.productName} - 重新定义你的生活方式`,
      `发现${input.productName}带来的惊喜`
    ],
    '品牌广告': [
      `${input.productName}，品质生活的选择`,
      `因为${input.productName}，所以不同`,
      `与${input.productName}一起，开启品质人生`
    ],
    '促销广告': [
      `${input.productName} - 限时优惠，不容错过`,
      `把握机会，让${input.productName}触手可及`,
      `${input.productName}，优惠来袭`
    ]
  }
  
  const options = concepts[input.adType] || concepts['产品广告']
  return options[Math.floor(Math.random() * options.length)]
}

export function generateStoryOutline(input: CreativeInput): string {
  const duration = parseInt(input.duration) || 30
  const parts = Math.ceil(duration / 10)
  
  let outline = ''
  
  // 开场
  outline += `**开场 (0-${Math.round(duration * 0.2)}s)**\n`
  outline += `建立场景，引出需求/痛点\n\n`
  
  // 主体
  for (let i = 1; i <= parts; i++) {
    const start = Math.round(duration * 0.2 * i)
    const end = Math.round(duration * 0.2 * (i + 1))
    outline += `**主体 ${i} (${start}s-${end}s)**\n`
    outline += `展示产品核心功能与价值\n\n`
  }
  
  // 结尾
  outline += `**结尾 (${Math.round(duration * 0.8)}s-${duration}s)**\n`
  outline += `情感升华 + 行动号召`
  
  return outline
}

export function generateStoryboard(input: CreativeInput): string {
  const duration = parseInt(input.duration) || 30
  const shots = duration <= 30 ? 6 : (duration <= 60 ? 10 : 15)
  const secondsPerShot = duration / shots
  
  let board = ''
  
  for (let i = 1; i <= shots; i++) {
    const startTime = Math.round((i - 1) * secondsPerShot)
    const endTime = Math.round(i * secondsPerShot)
    
    board += `### 镜头 ${i} (${startTime}s - ${endTime}s)\n`
    board += `- **景别**: ${['特写', '近景', '中景', '全景', '远景'][i % 5]}\n`
    board += `- **画面**: 描述场景...\n`
    board += `- **运镜**: ${['固定', '推', '拉', '摇', '移'][i % 5]}\n`
    board += `- **时长**: ${secondsPerShot}秒\n`
    board += `- **台词**: \n`
    board += `- **音效**: \n\n`
  }
  
  return board
}

export function generateVisualStyle(storyType: string): {
  style: string
  palette: string
  camera: string
} {
  const styles: Record<string, { style: string; palette: string; camera: string }> = {
    '科幻': { style: '未来科技感', palette: '蓝紫霓虹', camera: '大量航拍和CG特效' },
    '爱情': { style: '温馨浪漫', palette: '柔粉暖黄', camera: '柔焦和慢镜头' },
    '悬疑': { style: '紧张神秘', palette: '暗色调蓝绿', camera: '手持和跟拍' },
    '恐怖': { style: '惊悚压抑', palette: '黑白红', camera: '主观视角和长镜头' },
    '动作': { style: '激烈动感', palette: '高对比撞色', camera: '快速剪辑和运动镜头' },
    '喜剧': { style: '明快活泼', palette: '明亮暖色', camera: '轻快跳切' },
    '战争': { style: '史诗宏大', palette: '冷灰土黄', camera: '航拍和战场全景' },
    '奇幻': { style: '梦幻神奇', palette: '绚丽多彩', camera: '奇幻运镜' },
    '默认': { style: '现代简约', palette: '中性色调', camera: '专业稳定' }
  }
  
  return styles[storyType] || styles['默认']
}

export function generateMusicRecommendation(tone: string): string {
  const music: Record<string, string> = {
    '温馨': '温暖钢琴 + 弦乐',
    '励志': '史诗管弦 + 鼓点',
    '紧张': '悬疑配乐 + 节奏',
    '浪漫': '抒情吉他 + 弦乐',
    '科技': '电子合成 + 未来感',
    '欢快': '轻快流行 + 节奏',
    '感人': '抒情慢歌 + 钢琴',
    '默认': '现代流行 + 轻音乐'
  }
  
  return music[tone] || music['默认']
}

export function generateAll(input: CreativeInput): CreativeOutput {
  return {
    coreConcept: generateCoreConcept(input),
    storyOutline: generateStoryOutline(input),
    storyboard: generateStoryboard(input),
    visualStyle: generateVisualStyle(input.storyType).style,
    colorPalette: generateVisualStyle(input.storyType).palette,
    musicRecommendation: generateMusicRecommendation(input.tone || '默认')
  }
}
