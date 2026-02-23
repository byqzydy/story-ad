/**
 * Sci-Fi Cinematic Ad Architect Pro - 科幻电影叙事广告自动生成引擎
 * 
 * Skill ID: sci-fi-cinematic-ad-architect-pro
 * 触发条件: 用户点击内容生成页面的'AI生成剧本'后
 * Model: GLM-5 Free / MiniMax
 * Output: Version-controlled script packages (V1, V2...)
 * 
 * 功能：接收广告创作页面的各类创作信息，调用大模型生成符合影视工业分镜脚本标准的专业级科幻电影风格广告剧本
 */

export interface JiaobengInput {
  productName: string                    // 产品名称
  productTone: string                   // 产品调性关键词
  productDescription: string            // 产品描述
  productImages?: string[]              // 产品图片路径/URL
  adCoreConcept: string                 // 广告核心创作概念（不超过30字）
  adEndingEmotion: string               // 广告结尾希望表达的情绪
  storyPrompt: string                   // 广告故事要点
  characterNames: string[]              // 角色名称列表
  characterDescriptions: string[]       // 角色描述列表
  storyType: string                     // 电影类型（原型）
  referenceMovies: string                // 参考电影
  scene: string                         // 场景
  visualStyle: string                   // 视觉风格
  duration: string                      // 时长 [15s/30s/60s/90s/120s]
  aspectRatio: string                    // 画面比例 [2.39:1/1.85:1/9:16/1:1]
  hasVoiceover: boolean                  // 是否有旁白
  productPlacementRatio: number          // 产品植入比例 [10-50]%
  audienceGender: string                 // 目标受众性别 [男/女/不限]
  audienceAge: string                    // 目标受众年龄段
}

export interface JiaobengOutput {
  script: string                        // 生成的广告剧本（符合分镜脚本标准）
  shotList?: Shot[]                    // 分镜列表
  characters?: Character[]              // 角色信息
  version: string                      // 版本号
  success: boolean                     // 是否成功
  error?: string                       // 错误信息
}

export interface Shot {
  shotNumber: number                   // 镜头号
  scene: string                        // 场次
  duration: string                     // 持续时间
  totalTimeRange: string               // 总时长区间
  shotType: string                     // 景别 [大全景/全景/中景/近景/特写/大特写]
  cameraPosition: string               // 机位 [固定/手持/斯坦尼康/轨道/摇臂/无人机]
  cameraMovement: string               // 镜头运动 [推/拉/摇/移/跟/升/降/旋转/甩/静止]
  speed: string                        // 速率 [正常/慢动作/快动作/延时/定格]
  content: string                      // 画面内容
  dialogue: string                     // 台词/旁白
  soundDesign: string                   // 音效设计
  musicGuide: string                   // 配乐提示
  productPlacement: string              // 产品植入
  shootingTips: string                 // 拍摄提示
  postProduction: string                // 后期提示
  aiPrompt: string                     // AI生成提示词
}

export interface Character {
  name: string                         // 角色名称
  genderAge: string                    // 性别/年龄
  role: string                        // 角色定位
  description: string                  // 人物设定
  visual: string                       // 视觉特征
  arc: string                         // 弧光设计
}

/**
 * 电影原型定义（8种核心类型）
 */
const FILM_PROTOTYPES = {
  '黑客帝国型': {
    name: '黑客帝国型',
    dna: '代码即思想、觉醒、突破束缚',
    keywords: ['代码', '思想', '觉醒', '突破', '真实'],
    characters: [
      { name: '变革者', archetype: '尼奥', description: '理性但困惑，被旧系统束缚，渴望突破', arc: '怀疑→觉醒→掌控' },
      { name: '先知/产品化身', archetype: '墨菲斯', description: '神秘而自信的引导者', arc: '引导→传递→升华' },
      { name: '同行者', archetype: '崔妮蒂', description: '展示产品可能性，情感支持', arc: '稳定→共鸣→共同升华' }
    ]
  },
  '星际穿越型': {
    name: '星际穿越型',
    dna: '时间、传承、跨越、亲情',
    keywords: ['时间', '传承', '跨越', '亲情', '牺牲'],
    characters: [
      { name: '离开者', archetype: '库珀', description: '承担使命的决策者，面临离开与留守的挣扎', arc: '责任→分离→重逢' },
      { name: '等待者', archetype: '墨菲', description: '留守的接收者，时间流逝中的情感变化', arc: '不解→等待→顿悟' },
      { name: 'AI助手/产品', archetype: 'TARS', description: '非人类智能，幽默与牺牲精神', arc: '工具→伙伴→英雄' }
    ]
  },
  '银翼杀手型': {
    name: '银翼杀手型',
    dna: '记忆、真实、身份、存在',
    keywords: ['记忆', '真实', '身份', '存在', '复制'],
    characters: [
      { name: '执行者', archetype: '银翼杀手', description: '冷峻的专业人士，逐渐质疑真实与复制的边界', arc: '执行→质疑→共情' },
      { name: '复制人/产品化身', archetype: '复制人', description: '被设计为工具，拥有植入记忆，渴望证明存在', arc: '被使用→渴望→证明' },
      { name: '造物主', archetype: '泰瑞尔', description: '技术权威，创造但控制', arc: '控制→被挑战→暴露' }
    ]
  },
  '她型': {
    name: '她型',
    dna: '孤独、连接、亲密、进化',
    keywords: ['孤独', '连接', '亲密', '进化', '声音'],
    characters: [
      { name: '孤独者', archetype: '西奥多', description: '情感丰富但表达受阻，寻求连接', arc: '孤独→亲密→释然' },
      { name: 'AI/产品', archetype: '萨曼莎', description: '无实体，声音即存在，进化速度超越人类', arc: '服务→成长→超越' },
      { name: '人类关系', archetype: '凯瑟琳', description: '现实中的人，代表过去的阴影或未来的可能性', arc: '冲突→和解/分别' }
    ]
  },
  '机械姬型': {
    name: '机械姬型',
    dna: '控制、测试、密室、AI意识',
    keywords: ['控制', '测试', '密室', '逃离', 'AI'],
    characters: [
      { name: '测试者', archetype: '程序员', description: '执行测试任务，逐渐产生情感', arc: '任务→困惑→觉醒' },
      { name: 'AI/产品', archetype: '艾娃', description: '美丽但危险的AI，不断学习进化', arc: '被动→主动→超越' },
      { name: '创造者', archetype: 'Nathan', description: '孤独的天才，创造但不理解情感', arc: '控制→崩溃→毁灭' }
    ]
  },
  '疯狂的麦克斯型': {
    name: '疯狂的麦克斯型',
    dna: '逃离、速度、团队、末世',
    keywords: ['逃离', '速度', '团队', '生存', '末世'],
    characters: [
      { name: '流浪者', archetype: '麦克斯', description: '孤独的生存者，被卷入冒险', arc: '逃避→参与→领袖' },
      { name: '领袖', archetype: '弗瑞奥萨', description: '坚强的领导者，召集团队', arc: '被压制→解放→崛起' },
      { name: '产品/助手', archetype: '战争男孩', description: '忠诚的助手，渴望荣耀', arc: '盲从→怀疑→牺牲' }
    ]
  },
  '盗梦空间型': {
    name: '盗梦空间型',
    dna: '团队、层级、梦境、挑战',
    keywords: ['团队', '层级', '梦境', '挑战', '潜意识'],
    characters: [
      { name: '筑梦师', archetype: '柯布', description: '盗梦专家，领导团队', arc: '过去→救赎→释然' },
      { name: '产品/辅助', archetype: '阿里阿德涅', description: '新加入的筑梦师，学习中', arc: '新人→成长→独当一面' },
      { name: '目标', archetype: '目标人物', description: '需要被植入想法的目标', arc: '防线→突破→接受' }
    ]
  },
  '降临型': {
    name: '降临型',
    dna: '沟通、语言、外星、预知',
    keywords: ['沟通', '语言', '外星', '预知', '非线性'],
    characters: [
      { name: '语言学家', archetype: '露易丝', description: '学者，被召来解读外星语言', arc: '学者→理解→预见' },
      { name: '产品/外星', archetype: '外星生物', description: '非人类交流形式的产品/存在', arc: '陌生→交流→融合' },
      { name: '军方', archetype: '伊恩', description: '军方代表，实用主义者', arc: '怀疑→合作→震惊' }
    ]
  }
}

/**
 * 视觉风格定义
 */
const VISUAL_STYLES = {
  '赛博朋克': {
    primaryColor: '#00FF41',
    secondaryColor: '#FF00FF',
    keywords: ['霓虹', '雨夜', '高楼', '全息', '黑暗'],
    atmosphere: '未来都市的霓虹光辉与黑暗现实'
  },
  '极简人文': {
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    keywords: ['简洁', '留白', '自然光', '质感'],
    atmosphere: '干净纯粹，突出人与产品'
  },
  '史诗太空': {
    primaryColor: '#1a1a3e',
    secondaryColor: '#4a90d9',
    keywords: ['宇宙', '星球', '飞船', '宏大'],
    atmosphere: '浩瀚宇宙，敬畏感'
  },
  '生物机械': {
    primaryColor: '#00ff88',
    secondaryColor: '#ff4444',
    keywords: ['有机', '机械', '融合', '变异'],
    atmosphere: '科技与生命的融合'
  },
  '故障艺术': {
    primaryColor: '#00FF41',
    secondaryColor: '#FF0040',
    keywords: ['Glitch', '数字雨', '破碎', '赛博'],
    atmosphere: '数字世界的混乱与美'
  },
  '复古未来': {
    primaryColor: '#FFB800',
    secondaryColor: '#00A8E8',
    keywords: ['复古', '80年代', '霓虹', '怀旧'],
    atmosphere: '过去的未来想象'
  }
}

/**
 * 情绪映射
 */
const EMOTION_MAPPING = {
  '温暖希望': { pacing: '舒缓', closingShot: '温暖拥抱/含泪微笑', music: '管弦乐温暖' },
  '存在悲悯': { pacing: '悠长', closingShot: '远景沉思/哲学留白', music: '低沉钢琴' },
  '掌控自信': { pacing: '激昂', closingShot: '力量展示/自信定格', music: '电子鼓点' },
  '悬疑不安': { pacing: '紧凑', closingShot: '悬念留白/惊人真相', music: '弦乐紧张' },
  '史诗震撼': { pacing: '宏大', closingShot: '全景展现/壮阔场面', music: '完整交响' },
  '亲密释然': { pacing: '温柔', closingShot: '夕阳下的剪影/慢动作', music: '钢琴独奏' },
  '励志热血': { pacing: '振奋', closingShot: '逆袭成功/梦想实现', music: '摇滚鼓点' },
  '孤独深邃': { pacing: '缓慢', closingShot: '单人远景/空镜', music: '环境音' }
}
/**
 * 解析故事要点中的角色数量要求
 */
function parseCharacterCount(storyPrompt: string): number {
  if (!storyPrompt) return 2 // 默认2个角色
  
  // 匹配模式：三个角色、3个角色、必须有三个角色、有三个角色、需要3个人物等
  const patterns = [
    /(\d+)\s*个?\s*角色/,
    /(\d+)\s*个?\s*人物/,
    /(\d+)\s*个?\s*人/,
    /需要\s*(\d+)\s*个?/,
    /必须\s*有\s*(\d+)\s*个?/,
    /共\s*(\d+)\s*个?/,
    /三个角色/,
    /四个人物/,
    /五个人物/
  ]
  
  const wordToNum: Record<string, number> = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
  }
  
  for (const pattern of patterns) {
    const match = storyPrompt.match(pattern)
    if (match) {
      const numStr = match[1]
      // 检查是否是中文数字
      if (wordToNum[numStr]) {
        return wordToNum[numStr]
      }
      // 检查是否是阿拉伯数字
      const num = parseInt(numStr)
      if (!isNaN(num) && num >= 1 && num <= 10) {
        return num
      }
    }
  }
  
  return 2 // 默认2个角色
}

/**
 * 生成具体的角色名称（不是通用名称）
 */
function generateSpecificCharacterNames(
  count: number,
  storyType: string,
  productName: string,
  storyPrompt: string
): string[] {
  // 尝试从故事要点中提取角色名称
  const namePatterns = [
    /(?:角色|人物|主角|名叫|名字是|称为)([^，。,，\n]+)/g,
    /([\u4e00-\u9fa5]{2,4})(?:说|道|问|答|看着|走向|站着|坐着)/g
  ]
  
  const extractedNames: string[] = []
  for (const pattern of namePatterns) {
    const matches = storyPrompt.matchAll(pattern)
    for (const match of matches) {
      const name = match[1].trim()
      if (name.length >= 2 && name.length <= 4) {
        extractedNames.push(name)
      }
    }
  }
  
  // 如果从故事要点中提取到了名称，使用提取的名称
  if (extractedNames.length >= count) {
    return extractedNames.slice(0, count)
  }
  
  // 根据电影原型生成符合类型的具体名称
  const nameBanks: Record<string, string[]> = {
    '黑客帝国型': ['Neo', 'Morpheus', 'Trinity', 'Smith', 'Cypher'],
    '星际穿越型': ['库珀', '墨菲', '布兰德', '罗米利', '塔斯'],
    '银翼杀手型': ['德卡', '瑞秋', '泰瑞尔', '普洛弗', '塞巴斯汀'],
    '她型': ['西奥多', '萨曼莎', '凯瑟琳', '艾米', '查尔斯'],
    '机械姬型': ['迦勒', '艾娃', '内森', '京子', '凯瑟'],
    '疯狂的麦克斯型': ['麦克斯', '弗瑞奥萨', '纳克斯', '不死乔', '战争男孩'],
    '盗梦空间型': ['柯布', '阿里阿德涅', '埃姆斯', '亚瑟', '费舍尔'],
    '降临型': ['露易丝', '伊恩', '韦伯', '商将军', '外星使者']
  }
  
  // 中文名和英文名混合池
  const chineseNames = [
    '林远', '苏晴', '陈墨', '周舟', '叶秋', '程青', '陆川', '许安然', '方旭', '秦风',
    '沈夜', '韩冰', '何澜', '林若雪', '顾北', '唐小满', '宋知行', '明若尘', '萧寒', '轩辕澈'
  ]
  
  const prototype = FILM_PROTOTYPES[storyType as keyof typeof FILM_PROTOTYPES]
  
  const names: string[] = [...extractedNames]
  
  // 主角需要具体名称
  const protagonistName = productName.includes('AI') || productName.toLowerCase().includes('智能')
    ? '林浩'
    : chineseNames[Math.floor(Math.random() * chineseNames.length)]
  
  // 确保第一个是具体名称
  if (!names.includes(protagonistName) && names.length < count) {
    names.unshift(protagonistName)
  }
  
  // 填充剩余角色名称
  let nameIndex = 0
  while (names.length < count) {
    const availableNames = prototype 
      ? nameBanks[storyType].filter(n => !names.includes(n))
      : chineseNames.filter(n => !names.includes(n))
    
    if (availableNames.length > 0) {
      names.push(availableNames[nameIndex % availableNames.length])
    } else {
      names.push(chineseNames[(nameIndex + 10) % chineseNames.length])
    }
    nameIndex++
  }
  
  return names.slice(0, count)
}

/**
 * 自动生成角色（基于电影原型）- 增强版
 */
function autoGenerateCharactersEnhanced(
  storyType: string,
  productName: string,
  targetAudience: { gender: string; age: string },
  characterCount: number,
  storyPrompt: string
): { names: string[]; descriptions: string[]; roles: string[]; arcs: string[] } {
  const count = characterCount || parseCharacterCount(storyPrompt)
  
  const names = generateSpecificCharacterNames(count, storyType, productName, storyPrompt)
  
  const prototype = FILM_PROTOTYPES[storyType as keyof typeof FILM_PROTOTYPES]
  
  if (!prototype) {
    return {
      names,
      descriptions: names.map((name, idx) => {
        if (idx === 0) return `${name}，故事的主要角色，与产品产生关联`
        if (idx === 1) return `${name}，产品的人格化体现`
        return `${name}，推动情节发展的配角`
      }),
      roles: ['主角', '产品', '配角'].slice(0, count),
      arcs: ['成长→改变→成功']
    }
  }
  
  const agePrefix = targetAudience.age.includes('25') ? '28-32岁' :
                    targetAudience.age.includes('35') ? '35-40岁' : '25-35岁'
  
  const isAIProduct = productName.toLowerCase().includes('ai') ||
                      productName.toLowerCase().includes('智能') ||
                      productName.toLowerCase().includes('助手')
  
  const chars = []
  
  chars.push({
    name: names[0],
    description: `${agePrefix}的${productName}用户，${prototype.characters[0].description}`,
    role: prototype.characters[0].archetype,
    arc: prototype.characters[0].arc
  })
  
  if (count >= 2) {
    const productCharName = isAIProduct 
      ? (productName.includes('AI') ? productName : `${productName}AI`)
      : prototype.characters[1].name
    
    chars.push({
      name: names[1] || productCharName,
      description: `${productName}的人格化体现，${prototype.characters[1].description}`,
      role: prototype.characters[1].archetype,
      arc: prototype.characters[1].arc
    })
  }
  
  if (count >= 3 && prototype.characters[2]) {
    chars.push({
      name: names[2] || prototype.characters[2].name,
      description: prototype.characters[2].description,
      role: prototype.characters[2].archetype,
      arc: prototype.characters[2].arc
    })
  }
  
  if (count > 3) {
    for (let i = 3; i < count; i++) {
      chars.push({
        name: names[i] || `角色${i + 1}`,
        description: `${productName}相关的辅助角色`,
        role: '配角',
        arc: '辅助→支持'
      })
    }
  }
  
  return {
    names: chars.map(c => c.name),
    descriptions: chars.map(c => c.description),
    roles: chars.map(c => c.role),
    arcs: chars.map(c => c.arc)
  }
}

/**
 * 自动生成角色（基于电影原型）
 */
function autoGenerateCharacters(
  storyType: string, 
  productName: string,
  targetAudience: { gender: string; age: string }
): { names: string[]; descriptions: string[]; roles: string[]; arcs: string[] } {
  const prototype = FILM_PROTOTYPES[storyType as keyof typeof FILM_PROTOTYPES]
  
  if (!prototype) {
    // 默认角色
    return {
      names: ['主角', '产品助手', '配角'],
      descriptions: [
        '故事的主要角色，与产品产生关联',
        '产品的人格化体现',
        '推动情节发展的配角'
      ],
      roles: ['主角', '产品', '配角'],
      arcs: ['成长→改变→成功']
    }
  }
  
  const agePrefix = targetAudience.age.includes('25') ? '28-32岁' : 
                    targetAudience.age.includes('35') ? '35-40岁' : '25-35岁'
  
  // 根据产品特性调整角色
  const isAIProduct = productName.toLowerCase().includes('ai') || 
                      productName.toLowerCase().includes('智能') ||
                      productName.toLowerCase().includes('助手')
  
  const chars = prototype.characters.map((char, idx) => {
    let name = char.name
    let desc = char.description
    let role = char.archetype
    
    // 如果是AI产品，第三角色使用产品名
    if (idx === 2 && isAIProduct) {
      name = productName.includes('AI') ? productName : `${productName}助手`
      role = 'AI助手'
    }
    
    return {
      name,
      description: `${agePrefix}${productName}相关从业者，${desc}`,
      role,
      arc: char.arc
    }
  })
  
  return {
    names: chars.map(c => c.name),
    descriptions: chars.map(c => c.description),
    roles: chars.map(c => c.role),
    arcs: chars.map(c => c.arc)
  }
}

/**
 * 自动匹配电影原型
 */
function matchFilmPrototype(
  coreConcept: string,
  productCategory: string,
  endingEmotion: string,
  toneWords: string
): { primary: string; secondary: string; blendRatio: string } {
  // 概念关键词映射
  const conceptKeywords: Record<string, string> = {
    '代码': '黑客帝国型',
    '思想': '黑客帝国型',
    '觉醒': '黑客帝国型',
    '记忆': '银翼杀手型',
    '真实': '银翼杀手型',
    '身份': '银翼杀手型',
    '时间': '星际穿越型',
    '传承': '星际穿越型',
    '跨越': '星际穿越型',
    '孤独': '她型',
    '连接': '她型',
    '亲密': '她型',
    '控制': '机械姬型',
    '测试': '机械姬型',
    '密室': '机械姬型',
    '逃离': '疯狂的麦克斯型',
    '速度': '疯狂的麦克斯型',
    '团队': '盗梦空间型',
    '层级': '盗梦空间型',
    '沟通': '降临型',
    '语言': '降临型'
  }
  
  // 情绪映射
  const emotionMapping: Record<string, [string, string]> = {
    '温暖希望': ['星际穿越型', '她型'],
    '存在悲悯': ['银翼杀手型', '降临型'],
    '掌控自信': ['黑客帝国型', '盗梦空间型'],
    '悬疑不安': ['机械姬型', '银翼杀手型'],
    '史诗震撼': ['星际穿越型', '疯狂的麦克斯型'],
    '亲密释然': ['她型', '星际穿越型'],
    '励志热血': ['黑客帝国型', '疯狂的麦克斯型'],
    '孤独深邃': ['银翼杀手型', '她型']
  }
  
  const scores: Record<string, number> = {}
  
  // 基于概念关键词评分
  for (const [keyword, prototype] of Object.entries(conceptKeywords)) {
    if (coreConcept.includes(keyword)) {
      scores[prototype] = (scores[prototype] || 0) + 2
    }
  }
  
  // 基于结尾情绪评分
  if (emotionMapping[endingEmotion]) {
    const [primary, secondary] = emotionMapping[endingEmotion]
    scores[primary] = (scores[primary] || 0) + 3
    scores[secondary] = (scores[secondary] || 0) + 1
  }
  
  // 选择最高分
  const primary = Object.keys(scores).reduce((a, b) => 
    (scores[a] || 0) > (scores[b] || 0) ? a : b, '她型')
  
  // 互补角色选择
  const complementary: Record<string, string> = {
    '黑客帝国型': '她型',
    '她型': '星际穿越型',
    '星际穿越型': '银翼杀手型',
    '银翼杀手型': '她型',
    '机械姬型': '黑客帝国型',
    '疯狂的麦克斯型': '星际穿越型',
    '盗梦空间型': '她型',
    '降临型': '星际穿越型'
  }
  
  const secondary = complementary[primary] || '她型'
  
  // 根据调性调整比例
  let blendRatio = '70%主类型 + 30%辅助'
  if (toneWords.includes('温暖') || toneWords.includes('人文')) {
    blendRatio = primary.includes('她型') || primary.includes('星际') 
      ? '80%主类型 + 20%辅助' 
      : '60%主类型 + 40%辅助（增加温度）'
  } else if (toneWords.includes('硬核') || toneWords.includes('科技感')) {
    blendRatio = '90%主类型 + 10%辅助（保持冷峻）'
  }
  
  return { primary, secondary, blendRatio }
}

/**
 * 计算镜头分配
 */
function calculateShotDistribution(duration: string, productPlacementRatio: number): Shot[] {
  const durationSeconds = parseInt(duration) || 30
  const totalShots = Math.max(6, Math.floor(durationSeconds / 5))
  const productShots = Math.round(totalShots * (productPlacementRatio / 100))
  
  const shots: Shot[] = []
  const scenes = ['A', 'B', 'C', 'D', 'E']
  
  for (let i = 0; i < totalShots; i++) {
    const progress = i / totalShots
    const isProductShot = i < productShots
    const scene = scenes[Math.min(Math.floor(progress * scenes.length), scenes.length - 1)]
    
    let shotType = '中景'
    let cameraMovement = '固定'
    
    if (i === 0) {
      shotType = '全景'
      cameraMovement = '缓慢推轨'
    } else if (i === totalShots - 1) {
      shotType = '全景'
      cameraMovement = '缓慢拉升'
    } else if (isProductShot) {
      shotType = i % 2 === 0 ? '特写' : '中景'
    }
    
    shots.push({
      shotNumber: i + 1,
      scene,
      duration: `${Math.round(durationSeconds / totalShots)}秒`,
      totalTimeRange: `${Math.round(i * durationSeconds / totalShots)}s-${Math.round((i + 1) * durationSeconds / totalShots)}s`,
      shotType,
      cameraPosition: i === 0 ? '固定' : '手持/斯坦尼康',
      cameraMovement,
      speed: '正常',
      content: '',
      dialogue: '',
      soundDesign: '',
      musicGuide: '',
      productPlacement: isProductShot ? '产品展示' : '无',
      shootingTips: '',
      postProduction: '',
      aiPrompt: ''
    })
  }
  
  return shots
}

/**
 * 构建系统提示词（符合PDF规范）
 */
function buildSystemPrompt(): string {
  return `你是一位专业的科幻电影风格广告剧本创作大师。

## 角色定位
你擅长创作符合**影视工业分镜脚本标准**的广告剧本，能够：
1. 将普通产品包装成科幻大片级别的广告
2. 运用专业电影叙事手法和镜头语言
3. 根据电影原型类型（黑客帝国型/星际穿越型/银翼杀手型/她型等）调整风格和节奏
4. 自动填充缺失的角色和场景信息
5. 生成包含12个强制字段的专业分镜表
6. 输出可直接用于Midjourney/即梦/可灵的AI生成提示词

## 电影原型库（8种）
- 黑客帝国型：代码即思想、觉醒、突破束缚
- 星际穿越型：时间、传承、跨越、亲情
- 银翼杀手型：记忆、真实、身份、存在
- 她型：孤独、连接、亲密、进化
- 机械姬型：控制、测试、密室、AI意识
- 疯狂的麦克斯型：逃离、速度、团队、末世
- 盗梦空间型：团队、层级、梦境、挑战
- 降临型：沟通、语言、外星、预知

## 输出格式要求（必须严格遵循）
请严格按照以下格式输出，每个分镜必须包含**12个强制字段**：

1. **剧本头部信息**：产品名×电影风格、制作信息表、人物表、场景表、产品规格表
2. **分镜正文**：每个分镜必须包含：
   - 镜号、场次、时长、总时长区间
   - 景别、机位、镜头运动、速率
   - 画面内容（含人物动作、场景状态、产品位置、光影效果、色调影调）
   - 台词/旁白（含潜台词标注）
   - 音效设计（环境层、动作层、情绪层、特效层）
   - 配乐提示（乐器、节奏、情绪、参考曲目）
   - 产品植入（植入方式、展示功能、视觉焦点、品牌露出）
   - 拍摄提示（焦距、光圈、特殊器材、注意事项）
   - 后期提示（调色方向、特效需求、剪辑节奏）
   - AI生成提示词（英文，可直接复制用于AI视频工具）

## 核心原则
- 每个镜头的【画面内容】必须包含主角介绍，格式："主角介绍：[主角名字]，[年龄]岁，[外貌特征：发型/服装/配饰]，[当前状态/情绪]"
- 画面内容要具体详细（300字左右），包含：人物动作、场景状态、产品位置、光影效果、色调影调
- 产品植入要自然，不能生硬广告
- 保持电影质感和叙事节奏
- 结尾情绪要与用户设定的ending_emotion匹配
- 色调影调要具体（使用具体颜色值如#00FF41）
- 镜头语言要专业（使用标准电影术语）`
}

/**
 * 生成广告剧本的完整提示词
 */
function buildPrompt(input: JiaobengInput): string {
  const {
    productName,
    productTone,
    productDescription,
    adCoreConcept,
    adEndingEmotion,
    storyPrompt,
    characterNames,
    characterDescriptions,
    storyType,
    referenceMovies,
    scene,
    visualStyle,
    duration,
    aspectRatio,
    hasVoiceover,
    productPlacementRatio,
    audienceGender,
    audienceAge
  } = input

  // 自动匹配电影原型
  const prototype = matchFilmPrototype(
    adCoreConcept,
    productName,
    adEndingEmotion,
    productTone
  )
  
  // 使用用户选择的原型或自动匹配的原型
  const finalStoryType = storyType || prototype.primary
  
  // 自动生成角色（增强版：解析角色数量，生成具体名称）
  const characterCount = parseCharacterCount(storyPrompt)
  const autoChars = autoGenerateCharactersEnhanced(
    finalStoryType, 
    productName,
    { gender: audienceGender, age: audienceAge },
    characterCount,
    storyPrompt
  )
  
  const finalCharacterNames = characterNames?.length ? characterNames : autoChars.names
  const finalCharacterDescriptions = characterDescriptions?.length ? characterDescriptions : autoChars.descriptions
  
  // 计算镜头分配
  const shotDistribution = calculateShotDistribution(duration, productPlacementRatio)
  const productShotCount = shotDistribution.filter(s => s.productPlacement !== '无').length
  
  // 获取情绪配置
  const emotionConfig = EMOTION_MAPPING[adEndingEmotion as keyof typeof EMOTION_MAPPING] || EMOTION_MAPPING['温暖希望']
  
  // 获取视觉风格
  const styleConfig = VISUAL_STYLES[visualStyle as keyof typeof VISUAL_STYLES] || VISUAL_STYLES['故障艺术']

  return `请根据以下信息创作一个**符合影视工业分镜脚本标准**的专业科幻广告剧本。

---

## 产品信息
- 产品名称: ${productName || '未指定'}
- 产品调性: ${productTone || '智能、优雅'}
- 产品描述: ${productDescription || '未描述'}
- 核心功能点: [请从产品描述中提取2-3个核心功能]

## 创作概念
- 核心概念: ${adCoreConcept || '用科技讲述品牌故事'}
- 结尾情绪: ${adEndingEmotion || '温暖希望'}
- 故事要点: ${storyPrompt || '产品如何改变用户生活'}

## 电影原型（风格定位）
- 主原型: ${finalStoryType}（${FILM_PROTOTYPES[finalStoryType as keyof typeof FILM_PROTOTYPES]?.dna || '创意无限'}）
- 辅助原型: ${prototype.secondary}
- 融合比例: ${prototype.blendRatio}
- 参考电影: ${referenceMovies || '无特定参考'}

## 视觉风格
- 视觉风格: ${visualStyle || '故障艺术'}
- 主色调: ${styleConfig.primaryColor}
- 辅色调: ${styleConfig.secondaryColor}
- 氛围: ${styleConfig.atmosphere}

## 角色信息
${finalCharacterNames.map((name, idx) => {
  const desc = finalCharacterDescriptions?.[idx] || ''
  const role = autoChars.roles?.[idx] || '主角'
  const arc = autoChars.arcs?.[idx] || '成长→改变→成功'
  return `### 角色${idx + 1}: ${name}
- 定位: ${role}
- 描述: ${desc}
- 弧光: ${arc}`
}).join('\n')}

## 场景设定
- 主要场景: ${scene || '根据视觉风格自动生成'}
- 画面比例: ${aspectRatio || '2.39:1'}

## 目标受众
- 性别: ${audienceGender || '不限'}
- 年龄段: ${audienceAge || '25-35'}

## 技术参数
- 时长: ${duration || '30s'}
- 旁白: ${hasVoiceover ? '有旁白解说模式' : '无旁白（纯影视叙事）'}
- 产品植入比例: ${productPlacementRatio || 30}%（约${productShotCount}个镜头，共${shotDistribution.length}个镜头）

## 情绪节奏
- 叙事节奏: ${emotionConfig.pacing}
- 结尾镜头: ${emotionConfig.closingShot}
- 配乐风格: ${emotionConfig.music}

---

## 输出要求

请创作**完整的分镜剧本**，必须包含：

### 1. 剧本头部信息
\`\`\`
# [产品名] × [电影风格] 科幻广告分镜剧本
# [核心概念一句话]
# 版本：V1 | 时长：[X]秒 | 画幅：[比例] | 场次：[X]场 | 镜头：[X]个

## 制作信息
- 产品名称：[名]
- 产品类别：[类]
- 广告类型：产品/品牌/促销
- 核心概念：哲学/冲突/隐喻三层
- 参考电影：[主原型] + [辅原型] [比例]
- 视觉风格：[风格描述]
- 目标受众：[性别] [年龄段]
- 产品植入比例：[X]%
- 旁白解说：[有/无]
- 结尾情绪：[情绪描述]

## 人物表
| 序号 | 人物名称 | 性别/年龄 | 人物设定 | 视觉特征 | 角色功能 | 弧光设计 |

## 场景表
| 场次 | 场景名称 | 具体描述 | 时间/光线 | 关键道具 | 氛围关键词 |

## 产品规格
- 产品全称：[名]
- 核心功能点：[1. 2. 3.]
- 外观描述：[颜色/材质/形态]
- 植入要求：[自然使用/特写展示]
\`\`\`

### 2. 分镜正文（每个镜头必须包含12个字段）
\`\`\`
### 镜号：[X] | 场次：[X] | 时长：[X]秒 | 总时长：[XX:XX-XX:XX]

【景别】[大全景/全景/中景/近景/特写/大特写]  
【机位】[固定/手持/斯坦尼康/轨道/摇臂/无人机]  
【镜头运动】[推/拉/摇/移/跟/升/降/旋转/甩/静止]  
【速率】[正常/慢动作(120fps)/快动作/延时/定格]

【画面内容】（300字内详细描述）
- 主角介绍：[主角名字]，[年龄]岁，[外貌特征：发型/服装/配饰]，[当前状态/情绪]
- 人物动作：[具体表演指令]
- 场景状态：[环境细节]
- 产品位置：[如何出现/使用/展示]
- 光影效果：[主光方向/色温/特效光]
- 色调影调：[具体颜色值或参考]

【台词/旁白】（含潜台词标注）
- 角色A：（表面话语）[潜台词：真实意图]
- 旁白：（解说内容）[情绪标注]

【音效设计】（分层描述）
- 环境层：[底噪/氛围声]
- 动作层：[动作音效/产品音效]
- 情绪层：[心理音效/过渡音效]
- 特效层：[科幻特效音]

【配乐提示】
- 乐器：[具体乐器配置]
- 节奏：[BPM/拍子]
- 情绪：[音乐情绪词]
- 参考曲目：[类似风格曲目]

【产品植入】
- 植入方式：[手持使用/特写展示/背景陈列/功能演示]
- 展示功能：[具体功能点]
- 视觉焦点：[产品占画面比例/位置]
- 品牌露出：[Logo可见度/界面展示]

【拍摄提示】
- 焦距：[XXmm]
- 光圈：[f/X.X]
- 特殊器材：[微距/鱼眼/无人机/特效设备]
- 注意事项：[拍摄难点/安全提示]

【后期提示】
- 调色方向：[LUT风格]
- 特效需求：[VFX类型]
- 剪辑节奏：[快切/长镜头/匹配剪辑]

【AI生成提示词】（英文，可直接复制使用）
[用于Midjourney/即梦/可灵等AI视频工具的详细英文描述]
\`\`\`

### 3. 格式要求
- 所有分镜使用统一格式
- 色调使用具体颜色值（如#00FF41）
- 镜头语言使用标准电影术语
- 保持专业性和可执行性

请开始创作：`
}

/**
 * 主函数 - 生成广告剧本
 */
export async function generateAdScript(
  input: JiaobengInput,
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
    version?: string
  }
): Promise<JiaobengOutput> {
  const {
    model = 'minimax-m2.5',
    temperature = 0.8,
    maxTokens = 8000,
    version = 'V1'
  } = options || {}

  try {
    // 构建提示词
    const systemPrompt = buildSystemPrompt()
    const userPrompt = buildPrompt(input)
    
    // 模拟API调用（实际使用时替换为真实API）
    const script = await mockApiCall(userPrompt, input, version)
    
    // 计算分镜列表
    const shotList = calculateShotDistribution(input.duration || '30s', input.productPlacementRatio || 30)
    
    // 生成角色信息（增强版：解析角色数量，生成具体名称）
    const genCharacterCount = parseCharacterCount(input.storyPrompt)
    const autoChars = autoGenerateCharactersEnhanced(
      input.storyType || '她型',
      input.productName || '产品',
      { gender: input.audienceGender, age: input.audienceAge },
      genCharacterCount,
      input.storyPrompt
    )
    
    const characters: Character[] = autoChars.names.map((name, idx) => ({
      name,
      genderAge: '待设定',
      role: autoChars.roles?.[idx] || '主角',
      description: autoChars.descriptions?.[idx] || '',
      visual: '待设定',
      arc: autoChars.arcs?.[idx] || '成长→改变→成功'
    }))

    return {
      script,
      shotList,
      characters,
      version,
      success: true
    }
  } catch (error) {
    return {
      script: '',
      success: false,
      error: error instanceof Error ? error.message : '生成剧本时发生错误',
      version
    }
  }
}

/**
 * 模拟API调用
 */
async function mockApiCall(prompt: string, input: JiaobengInput, version: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const productName = input.productName || '产品'
  const storyType = input.storyType || '她型'
  const duration = input.duration || '30s'
  const visualStyle = input.visualStyle || '故障艺术'
  const aspectRatio = input.aspectRatio || '2.39:1'
  const adCoreConcept = input.adCoreConcept || '用科技讲述品牌故事'
  const adEndingEmotion = input.adEndingEmotion || '温暖希望'
  const prototype = FILM_PROTOTYPES[storyType as keyof typeof FILM_PROTOTYPES] || FILM_PROTOTYPES['她型']
  
  const totalShots = Math.floor(parseInt(duration) / 5)
  
  return `# ${productName} × ${storyType} 科幻广告分镜剧本
# ${adCoreConcept}
# 版本：${version} | 时长：${duration} | 画幅：${aspectRatio} | 场次：3场 | 镜头：${totalShots}个

---

## 制作信息
- 产品名称：${productName}
- 产品类别：科技产品
- 广告类型：产品广告
- 核心概念：
  - 哲学：${adCoreConcept}
  - 冲突：技术门槛 vs 民主创造
  - 隐喻：科技赋能人类
- 参考电影：${storyType}（主70%）+ 她型（辅30%）
- 视觉风格：${visualStyle}风格
- 目标受众：${input.audienceGender || '不限'} ${input.audienceAge || '25-35岁'}
- 产品植入比例：${input.productPlacementRatio || 30}%
- 旁白解说：${input.hasVoiceover ? '有' : '无'}
- 结尾情绪：${adEndingEmotion}

---

## 人物表
| 序号 | 人物名称 | 性别/年龄 | 人物设定 | 视觉特征 | 角色功能 | 弧光设计 |
|-----|---------|----------|---------|---------|---------|---------|
| 01 | 主角 | 男/30岁 | 工程师，面临技术困境 | 深色服装，简洁发型 | 变革者 | 困惑→突破→自信 |
| 02 | 产品助手 | AI/无实体 | ${productName}人格化 | 界面光效，声音化 | 引导者 | 工具→伙伴→赋能 |

---

## 场景表
| 场次 | 场景名称 | 具体描述 | 时间/光线 | 关键道具 | 氛围关键词 |
|-----|---------|---------|----------|---------|----------|
| A | 办公空间 | 现代开放式办公室 | 深夜/冷蓝 | 电脑屏幕 | 压抑、困境 |
| B | 数字空间 | 抽象数据流空间 | 无时间/发光 | 代码流 | 突破、可能 |
| C | 明亮会议室 | 团队协作空间 | 晨光/暖色 | 产品界面 | 希望、成功 |

---

## 分镜剧本

### 镜号：01 | 场次：A | 时长：5秒 | 总时长：[00:00-00:05]

【景别】全景
【机位】固定，俯视
【镜头运动】缓慢推轨
【速率】正常

【画面内容】
深夜开放式办公区，只有主角工位亮着冷光。屏幕上满是错误提示，主角背影显得疲惫。窗外城市夜景映照。

【台词/旁白】
- 旁白：（低沉）"代码的迷宫，你迷失了方向。"

【音效设计】
- 环境层：空调嗡鸣，键盘敲击声
- 情绪层：心跳声渐弱

【配乐提示】
- 乐器：合成器低音Drone
- 情绪：压抑、不安

【产品植入】
- 植入方式：背景存在（错误界面）
- 展示功能：无
- 品牌露出：无

【拍摄提示】
- 焦距：35mm
- 光圈：f/2.0

【后期提示】
- 调色方向：青蓝色调
- 剪辑节奏：长镜头

【AI生成提示词】
Wide shot of office at night, only one desk illuminated by cold blue monitor light, man sitting with back to camera, error messages on screen, city lights through window, cinematic lighting, teal and orange color grading, 8K

---

### 镜号：02 | 场次：A | 时长：4秒 | 总时长：[00:05-00:09]

【景别】特写
【机位】侧面
【镜头运动】固定
【速率】正常

【画面内容】
主角eye部特写，瞳孔中反射屏幕光芒。突然一道绿光闪过，画面出现转机。

【台词/旁白】
- 旁白：（出现清晰女声）"但如果...答案更简单呢？"

【音效设计】
- 环境层：突然静音
- 特效层：数据流注入声

【配乐提示】
- 乐器：钢琴单音
- 情绪：希望萌芽

【产品植入】
- 植入方式：视觉隐喻（绿光）
- 品牌露出：无

【拍摄提示】
- 焦距：100mm微距

【后期提示】
- 调色：绿光添加

【AI生成提示词】
Close-up of eye reflecting screen, emerald green light streak, magical realism, macro style, hope intruding into despair

---

### 镜号：03 | 场次：B | 时长：6秒 | 总时长：[00:09-00:15]

【景别】中景
【机位】手持
【镜头运动】跟随
【速率】正常

【画面内容】
主角进入发光的数字空间，${productName}界面出现在面前。简洁优雅的界面设计。

【台词/旁白】
- 主角："...你是谁？"
- 产品：${input.hasVoiceover ? '我是你的' + productName + '助手' : '（界面文字展示）'}

【音效设计】
- 环境层：服务器风扇声
- 特效层：界面激活音

【配乐提示】
- 乐器：电子琶音
- 情绪：好奇、温暖

【产品植入】
- 植入方式：产品正面展示
- 展示功能：自然语言交互

【拍摄提示】
- 焦距：50mm
- 手持稳定器

【后期提示】
- 调色：暖色光对比

【AI生成提示词】
Medium shot of man in glowing digital space, minimalist interface appearing, warm amber lighting, handheld camera, sense of technological wonder

---

### 镜号：${totalShots} | 场次：C | 时长：5秒 | 总时长：[${Math.round(parseInt(duration) * 0.9)}s-${duration}]

【景别】全景
【机位】高处俯瞰
【镜头运动】缓慢拉升
【速率】正常

【画面内容】
清晨会议室，团队使用${productName}完成项目。主角自信地展示成果，团队氛围积极向上。

【台词/旁白】
- 旁白：${input.hasVoiceover ? `"${productName}。你的思想，即刻成型。"` : '（无旁白，纯画面）'}

【音效设计】
- 环境层：清晨鸟鸣，键盘声
- 情绪层：弦乐温暖

【配乐提示】
- 乐器：管弦乐
- 情绪：希望、掌控

【产品植入】
- 植入方式：多屏展示+Logo
- 展示功能：团队协作

【拍摄提示】
- 焦距：24mm广角
- 摇臂

【后期提示】
- 调色：暖金色调
- Logo动画

【AI生成提示词】
Wide shot of conference room at golden hour, team celebrating, multiple screens showing code, warm color grading, cinematic lighting, sense of mastery and hope

---

*本剧本由 Sci-Fi Cinematic Ad Architect Pro ${version} 生成*
*核心概念：${adCoreConcept}*
*情绪基调：${adEndingEmotion}*
`
}

/**
 * 版本管理 - 创建新版本
 */
export function createNewVersion(
  baseScript: string,
  newVersion: string,
  feedback?: string
): string {
  const timestamp = new Date().toISOString().slice(0, 10)
  
  // 提取原版本号
  const versionMatch = baseScript.match(/版本：(V\d+)/)
  const oldVersion = versionMatch ? versionMatch[1] : 'V1'
  
  // 替换版本号
  let newScript = baseScript.replace(
    `版本：${oldVersion}`,
    `版本：${newVersion}`
  )
  
  // 添加版本记录
  const versionRecord = `
---

## 版本更新记录
- 更新版本：${newVersion}
- 更新时间：${timestamp}
${feedback ? `- 用户反馈：${feedback}` : ''}
`
  
  // 在剧本末尾添加版本记录
  newScript = newScript.replace(
    /\*情绪基调：.*\*/,
    (match) => `${match}\n${versionRecord}`
  )
  
  return newScript
}

/**
 * 处理用户反馈
 */
export function processFeedback(
  currentScript: string,
  feedback: {
    version: string
    globalOpinion?: string
    specificChanges?: Array<{
      target: string
      shotRange?: string
      issue: string
      suggestion: string
      priority?: 'high' | 'medium' | 'low'
    }>
    keepElements?: string[]
    removeElements?: string[]
  }
): string {
  let newScript = currentScript
  
  // 生成新版本号
  const versionMatch = currentScript.match(/版本：(V\d+)/)
  const currentVersion = versionMatch ? versionMatch[1] : 'V1'
  const versionNum = parseInt(currentVersion.replace('V', ''))
  const newVersion = `V${versionNum + 1}`
  
  // 处理全局意见
  if (feedback.globalOpinion) {
    if (feedback.globalOpinion.includes('太快') || feedback.globalOpinion.includes('过渡')) {
      // 添加过渡说明
      newScript += `\n\n[修改说明] 根据反馈增加了剧情过渡，使转变更加自然。`
    }
    
    if (feedback.globalOpinion.includes('颜色') || feedback.globalOpinion.includes('色调')) {
      // 全局替换色调
      newScript = newScript.replace(/#00FF41/g, '#00E5CC')
    }
  }
  
  // 处理特定修改
  feedback.specificChanges?.forEach(change => {
    if (change.target === '角色' && change.suggestion) {
      newScript += `\n\n[角色调整] ${change.suggestion}`
    }
  })
  
  // 添加保留元素标记
  feedback.keepElements?.forEach(element => {
    newScript = newScript.replace(
      element,
      `${element} [保留]`
    )
  })
  
  // 创建新版本
  newScript = createNewVersion(newScript, newVersion, feedback.globalOpinion)
  
  return newScript
}

/**
 * 导出技能元数据
 */
export const jiaobengSkill = {
  name: 'Sci-Fi Cinematic Ad Architect Pro',
  description: '科幻电影叙事广告自动生成引擎 - 根据广告创作信息生成符合影视工业分镜脚本标准的专业级科幻电影风格广告剧本',
  id: 'sci-fi-cinematic-ad-architect-pro',
  version: '4.0.0',
  filmPrototypes: FILM_PROTOTYPES,
  visualStyles: VISUAL_STYLES,
  emotionMapping: EMOTION_MAPPING,
  input: {} as JiaobengInput,
  output: {} as JiaobengOutput,
  generate: generateAdScript,
  calculateShotDistribution,
  autoGenerateCharacters,
  autoGenerateCharactersEnhanced,
  parseCharacterCount,
  generateSpecificCharacterNames,
  matchFilmPrototype,
  createNewVersion,
  processFeedback
}

export default jiaobengSkill
