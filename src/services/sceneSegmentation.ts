/**
 * Scene Segmentation Service for Movie Placement
 * 
 * Parses generated script and splits scenes into ≤15s video clips
 * Each clip becomes a prompt for Dream (即梦) AI video generation
 */

export interface Scene {
  id: string
  title: string
  timeRange: string
  startTime: number  // in seconds
  endTime: number    // in seconds
  location: string
  characters: string
  characterDescription: string
  visualDescription: string
  dialogue: string
  productAppearance?: string
}

export interface VideoClip {
  id: string
  sceneId: string
  sceneTitle?: string  // 场次标题（如"第一场"）
  clipIndex: number  // 0, 1, 2... for scenes split into multiple clips
  totalClips?: number  // 该场景被分成的总片段数
  startTime: number
  endTime: number
  prompt: string     // Full prompt for video generation
  aspectRatio: string
  isSingleClip?: boolean  // 是否单片段（整场戏一个视频）
}

export interface ScriptParseResult {
  title: string
  product: string
  duration: number
  aspectRatio: string
  scenes: Scene[]
  clips: VideoClip[]
}

/**
 * Parse script content into structured scene data
 * Supports two formats:
 * 1. New format: 第一场, 场景：xxx, 时间：夜外, （特写）...
 * 2. Old format: 【场景1】, 【时间】, 【地点】...
 */
export function parseScript(scriptContent: string, aspectRatio: string = '16:9'): ScriptParseResult {
  const result: ScriptParseResult = {
    title: '',
    product: '',
    duration: 0,
    aspectRatio,
    scenes: [],
    clips: []
  }
  
  // Try new format first (第一场, 场景：xxx)
  if (scriptContent.includes('第一场') || scriptContent.includes('场景：')) {
    return parseNewFormat(scriptContent, aspectRatio, result)
  }
  
  // Fall back to old format
  return parseOldFormat(scriptContent, aspectRatio, result)
}

/**
 * Parse new format: 第一场, 场景：xxx, 时间：夜外/内, （特写）...
 */
function parseNewFormat(scriptContent: string, aspectRatio: string, result: ScriptParseResult): ScriptParseResult {
  // Extract title
  const titleMatch = scriptContent.match(/剧本名[：:]\s*(.+)/)
  if (titleMatch) {
    result.title = titleMatch[1].trim()
  }
  
  // Extract duration (e.g., "约8-10分钟", "30秒", "1分钟")
  const durationMatch = scriptContent.match(/时长[：:]\s*(?:约)?(\d+)(?:-(\d+))?(分钟|秒)/)
  if (durationMatch) {
    const num1 = parseInt(durationMatch[1])
    const num2 = durationMatch[2] ? parseInt(durationMatch[2]) : num1
    const unit = durationMatch[3]
    if (unit === '分钟') {
      result.duration = Math.round((num1 + num2) / 2 * 60) // Convert to seconds
    } else {
      result.duration = num1
    }
  }
  
  // Extract product info
  const productMatch = scriptContent.match(/产品[：:]\s*(.+?)(?:\n|$)/)
  if (productMatch) {
    result.product = productMatch[1].trim()
  }
  
  // Extract character introductions (人物小传)
  const characterIntro: string[] = []
  const charIntroMatch = scriptContent.match(/人物小传\n([\s\S]*?)(?=\n第一场|$)/)
  if (charIntroMatch) {
    characterIntro.push(charIntroMatch[1].trim())
  }
  
  // Split by scenes: 第一场, 第二场...
  const lines = scriptContent.split('\n')
  
  let sceneIndex = 0
  let currentScene: Partial<Scene> = {}
  let currentCharacterIntro = ''
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const nextLine = lines[i + 1]?.trim() || ''
    
    // Skip empty lines and section headers
    if (!line || line.startsWith('——') || line.startsWith('（画面') || line.startsWith('(画面')) {
      continue
    }
    
    // Check for new scene (第一场, 第二场, etc.)
    const sceneMatch = line.match(/^第([一二三四五六七八九十\d]+)场[：:]?\s*(.*)/)
    if (sceneMatch) {
      // Save previous scene
      if (currentScene.title) {
        if (currentCharacterIntro) {
          currentScene.characterDescription = (currentScene.characterDescription || '') + '\n' + currentCharacterIntro
        }
        result.scenes.push(currentScene as Scene)
      }
      
      sceneIndex++
      currentCharacterIntro = characterIntro.join('\n')
      
      // Estimate time
      let startTime = (sceneIndex - 1) * 15
      let endTime = sceneIndex * 15
      
      currentScene = {
        id: `scene_${sceneIndex}`,
        title: sceneMatch[2] || `第${sceneMatch[1]}场`,
        timeRange: '',
        startTime,
        endTime,
        location: '',
        characters: '',
        characterDescription: currentCharacterIntro,
        visualDescription: '',
        dialogue: ''
      }
      continue
    }
    
    // Parse scene location: "场景：废弃火车站台"
    if (line.startsWith('场景：') || line.startsWith('场景:')) {
      currentScene.location = line.replace(/场景[：:]\s*/, '').trim()
    }
    // Parse time: "时间：夜，外"
    else if (line.startsWith('时间：') || line.startsWith('时间:')) {
      currentScene.timeRange = line.replace(/时间[：:]\s*/, '').trim()
    }
    // Parse camera shots: （特写）, （中景）, （全景）, etc.
    else if (/^（[特写中景全景近景远景画面]/.test(line) || /^\([特写中景全景近景远景画面]/.test(line)) {
      currentScene.visualDescription = (currentScene.visualDescription || '') + line + ' '
    }
    // Parse dialogue: "人物：" or "杰克："
    else if (line.match(/^[^人物：:]+[：:]\s*（/) || line.match(/^人物\s*[^：:]+[：:]/)) {
      currentScene.dialogue = (currentScene.dialogue || '') + line + '\n'
    }
    // Parse description lines (not starting with special markers, but containing scene details)
    // These are typically action/description lines like "雨夜中的火车站台，霓虹灯光在积水中反射"
    else if (line.length > 10 && !line.startsWith('【') && !line.startsWith('[') && currentScene.title) {
      // Check if it's a description line (ends with Chinese punctuation)
      if (/[，。？！⋯]/.test(line) || /[。？！⋯]/.test(line.slice(-1))) {
        currentScene.visualDescription = (currentScene.visualDescription || '') + line + ' '
      }
    }
  }
  
  // Add last scene
  if (currentScene.title) {
    if (currentCharacterIntro) {
      currentScene.characterDescription = (currentScene.characterDescription || '') + '\n' + currentCharacterIntro
    }
    result.scenes.push(currentScene as Scene)
  }
  
  // Calculate actual duration from scenes (based on 画面/镜头描述 content length: 150 chars = 10 seconds)
  if (result.scenes.length > 0) {
    let currentTime = 0
    result.scenes.forEach((scene) => {
      scene.startTime = currentTime
      // Calculate duration based ONLY on visual description length: 150 chars = 10 sec
      const visualLength = (scene.visualDescription || '').length
      const estimatedDuration = Math.ceil(visualLength / 150 * 10)
      scene.endTime = scene.startTime + Math.max(estimatedDuration, 5) // Minimum 5 seconds
      currentTime = scene.endTime
    })
    result.duration = currentTime
  }
  
  // Split scenes into clips
  result.clips = splitIntoClips(result.scenes, aspectRatio)
  
  return result
}

/**
 * Parse old format: 【场景1】, 【时间】, 【地点】...
 */
function parseOldFormat(scriptContent: string, aspectRatio: string, result: ScriptParseResult): ScriptParseResult {
  // Extract title
  const titleMatch = scriptContent.match(/【剧名】《(.+?)》/)
  if (titleMatch) {
    result.title = titleMatch[1]
  }
  
  // Extract product
  const productMatch = scriptContent.match(/【产品】(.+)/)
  if (productMatch) {
    result.product = productMatch[1].trim()
  }
  
  // Extract duration
  const durationMatch = scriptContent.match(/【时长】(\d+)/)
  if (durationMatch) {
    result.duration = parseInt(durationMatch[1])
  }
  
  // Extract aspect ratio if present
  const aspectMatch = scriptContent.match(/【画幅】(\d+:\d+)/)
  if (aspectMatch) {
    result.aspectRatio = aspectMatch[1]
  }
  
  // Parse scenes - simpler approach: find each scene block
  // Format: 【场景1】标题 (00:00-00:15) or 【场景1】标题 (0-15秒)
  const sceneBlocks = scriptContent.split(/(?=【场景\d+】|【广告词】|$)/)
  
  for (const block of sceneBlocks) {
    // Check if this is a scene block
    const sceneNumMatch = block.match(/【场景(\d+)】(.+?)\s*\((\d+):(\d+)-(\d+):(\d+)\)/)
    const sceneNumMatch2 = block.match(/【场景(\d+)】(.+?)\s*\((\d+)-(\d+)秒\)/)
    
    let sceneNum: string, title: string, startTime: number, endTime: number, content: string
    
    if (sceneNumMatch) {
      sceneNum = sceneNumMatch[1]
      title = sceneNumMatch[2].trim()
      const startMin = parseInt(sceneNumMatch[3])
      const startSec = parseInt(sceneNumMatch[4])
      const endMin = parseInt(sceneNumMatch[5])
      const endSec = parseInt(sceneNumMatch[6])
      startTime = startMin * 60 + startSec
      endTime = endMin * 60 + endSec
      content = block
    } else if (sceneNumMatch2) {
      sceneNum = sceneNumMatch2[1]
      title = sceneNumMatch2[2].trim()
      startTime = parseInt(sceneNumMatch2[3])
      endTime = parseInt(sceneNumMatch2[4])
      content = block
    } else {
      continue // Skip non-scene blocks
    }
    
    // Extract fields from scene content
    const locationMatch = content.match(/【地点】[：:]\s*(.+)/)
    const charactersMatch = content.match(/【人物】[：:]\s*(.+)/)
    const charDescMatch = content.match(/【人物描写】[：:]\s*([\s\S]*?)(?=【|$)/)
    const visualMatch = content.match(/【画面描述】[：:]\s*([\s\S]*?)(?=【|$)/)
    const dialogueMatch = content.match(/【对话[\/／]独白】[：:]\s*([\s\S]*?)(?=【|$)/)
    const productMatch = content.match(/【产品展示】[：:]\s*(.+)/)
    
    const scene: Scene = {
      id: `scene_${sceneNum}`,
      title: title.trim(),
      timeRange: `${startTime}-${endTime}秒`,
      startTime,
      endTime,
      location: locationMatch?.[1]?.trim() || '',
      characters: charactersMatch?.[1]?.trim() || '',
      characterDescription: charDescMatch?.[1]?.trim() || '',
      visualDescription: visualMatch?.[1]?.trim() || '',
      dialogue: dialogueMatch?.[1]?.trim() || '',
      productAppearance: productMatch?.[1]?.trim()
    }
    
    result.scenes.push(scene)
  }
  
  // Split scenes into clips (max 15s each)
  result.clips = splitIntoClips(result.scenes, aspectRatio)
  
  return result
}

/**
 * Split scenes into video clips
 * - Each scene creates one video task
 * - If scene duration exceeds MAX_CLIP_DURATION, split into multiple clips at sentence boundaries
 * - Each clip includes complete scene info (scene title, location, characters, etc.)
 * - Time estimation: 150 characters = 10 seconds
 * - Each clip continues from previous clip (no content repetition)
 */
function splitIntoClips(scenes: Scene[], aspectRatio: string): VideoClip[] {
  const clips: VideoClip[] = []
  const MAX_CLIP_DURATION = 10 // Seedance max duration per clip
  
  // Calculate duration based on content length: 150 chars = 10 seconds
  scenes.forEach((scene) => {
    // Estimate scene duration based on content length
    const contentLength = (scene.visualDescription || '').length + (scene.dialogue || '').length
    const estimatedDuration = Math.ceil(contentLength / 150 * 10) // 150 chars = 10 sec
    const duration = Math.max(estimatedDuration, 10) // Minimum 10 seconds
    
    // Update scene times based on actual content
    const prevScene = scenes[scenes.indexOf(scene) - 1]
    scene.startTime = prevScene ? prevScene.endTime : 0
    scene.endTime = scene.startTime + duration
    
    if (duration <= MAX_CLIP_DURATION) {
      // Scene fits in one clip - create one video task for this scene
      clips.push({
        id: `${scene.id}_clip_0`,
        sceneId: scene.id,
        sceneTitle: scene.title,  // Include scene title
        clipIndex: 0,
        startTime: scene.startTime,
        endTime: scene.endTime,
        prompt: buildPrompt(scene, aspectRatio, 0, 1, scene.startTime, scene.endTime, undefined, true),
        aspectRatio,
        isSingleClip: true  //标记这是单片段（整场戏）
      })
    } else {
      // Need to split scene into multiple clips
      // Split by content: each clip gets a portion of the visual description and dialogue
      const clipCount = Math.ceil(duration / MAX_CLIP_DURATION)
      
      // Split visual description into parts
      const visualParts = splitContentByClips(scene.visualDescription || '', clipCount)
      // Split dialogue into parts
      const dialogueParts = splitDialogueByClips(scene.dialogue || '', clipCount)
      
      for (let i = 0; i < clipCount; i++) {
        const clipDuration = duration / clipCount
        const clipStartTime = scene.startTime + (i * clipDuration)
        const clipEndTime = Math.min(clipStartTime + clipDuration, scene.endTime)
        
        // Combine visual description and dialogue for this clip
        const clipVisual = visualParts[i] || ''
        const clipDialogue = dialogueParts[i] || ''
        
        clips.push({
          id: `${scene.id}_clip_${i}`,
          sceneId: scene.id,
          sceneTitle: scene.title,  // Include scene title for all clips
          clipIndex: i,
          totalClips: clipCount,  // Total clips for this scene
          startTime: Math.round(clipStartTime),
          endTime: Math.round(clipEndTime),
          prompt: buildPrompt(scene, aspectRatio, i, clipCount, clipStartTime, clipEndTime, { visual: clipVisual, dialogue: clipDialogue }, false),
          aspectRatio,
          isSingleClip: false
        })
      }
    }
  })
  
  return clips
}

/**
 * Split content into parts for multiple clips (no repetition)
 */
function splitContentByClips(content: string, clipCount: number): string[] {
  if (!content || clipCount <= 1) return [content]
  
  // Split by sentences/paragraphs
  const sentences = content.split(/(?<=[。！？⋯])\s*/).filter(s => s.trim())
  if (sentences.length === 0) {
    // If no clear sentences, split by character count
    const charsPerClip = Math.ceil(content.length / clipCount)
    const parts: string[] = []
    for (let i = 0; i < clipCount; i++) {
      const start = i * charsPerClip
      const end = Math.min(start + charsPerClip, content.length)
      parts.push(content.slice(start, end))
    }
    return parts
  }
  
  // Distribute sentences across clips
  const sentencesPerClip = Math.ceil(sentences.length / clipCount)
  const parts: string[] = []
  
  for (let i = 0; i < clipCount; i++) {
    const start = i * sentencesPerClip
    const end = Math.min(start + sentencesPerClip, sentences.length)
    parts.push(sentences.slice(start, end).join(' '))
  }
  
  return parts
}

/**
 * Split dialogue into parts for multiple clips (no repetition)
 */
function splitDialogueByClips(dialogue: string, clipCount: number): string[] {
  if (!dialogue || clipCount <= 1) return [dialogue]
  
  // Split by newlines (each line is typically one dialogue)
  const lines = dialogue.split('\n').filter(l => l.trim())
  if (lines.length === 0) return [dialogue]
  
  // Distribute dialogue lines across clips
  const linesPerClip = Math.ceil(lines.length / clipCount)
  const parts: string[] = []
  
  for (let i = 0; i < clipCount; i++) {
    const start = i * linesPerClip
    const end = Math.min(start + linesPerClip, lines.length)
    parts.push(lines.slice(start, end).join('\n'))
  }
  
  return parts
}

/**
 * Split dialogue into sentences for proper clip segmentation
 */
function splitDialogueBySentences(dialogue: string): string[] {
  // Split by Chinese sentence endings or dialogue markers
  const sentences: string[] = []
  let currentSentence = ''
  
  const lines = dialogue.split('\n')
  for (const line of lines) {
    if (!line.trim()) continue
    
    currentSentence += (currentSentence ? '\n' : '') + line
    
    // Check if this is a complete sentence (ends with 。！？ or dialogue continuation)
    if (/[。！？⋯]/.test(line.slice(-1)) || line.includes('：')) {
      sentences.push(currentSentence.trim())
      currentSentence = ''
    }
  }
  
  // Add remaining content
  if (currentSentence.trim()) {
    sentences.push(currentSentence.trim())
  }
  
  return sentences
}

/**
 * Build prompt for a single scene clip
 * Output format matching user's expected format
 * - No content repetition across clips
 * - Each clip continues from previous clip
 */
function buildPrompt(
  scene: Scene, 
  aspectRatio: string, 
  clipIndex: number, 
  totalClips: number,
  clipStartTime?: number,
  clipEndTime?: number,
  clipContent?: { visual: string, dialogue: string } | string,
  isSingleClip?: boolean
): string {
  const parts: string[] = []
  
  // Scene info - include in ALL clips for consistency
  parts.push(`【场景】：${scene.location}`)
  parts.push(`【时间】：${scene.timeRange}`)
  
  // Add clip index info for multi-clip scenes
  if (totalClips > 1) {
    parts.push(`【片段】：${clipIndex + 1}/${totalClips}`)
  }
  
  // Visual description - use clip-specific content (no repetition)
  let visualDesc = ''
  let dialogue = ''
  
  if (typeof clipContent === 'object' && clipContent !== null) {
    visualDesc = clipContent.visual || ''
    dialogue = clipContent.dialogue || ''
  } else if (typeof clipContent === 'string') {
    dialogue = clipContent || ''
  } else if (isSingleClip) {
    visualDesc = scene.visualDescription || ''
    dialogue = scene.dialogue || ''
  }
  
  // Add visual description
  if (visualDesc) {
    parts.push(`【画面/镜头描述】：\n${visualDesc}`)
  }
  
  // Add dialogue
  if (dialogue) {
    parts.push(dialogue.trim())
  }
  
  // Add time info
  const startTime = clipStartTime ?? scene.startTime
  const endTime = clipEndTime ?? scene.endTime
  parts.push(`【时间段】：${Math.round(startTime)}-${Math.round(endTime)}秒`)
  
  // Add aspect ratio
  parts.push(`【画幅】：${aspectRatio}`)
  
  return parts.join('\n')
}

/**
 * Extract character appearance descriptions from all scenes
 * Used for maintaining consistency across video clips
 */
export function extractCharacterDescriptions(scenes: Scene[]): Record<string, string> {
  const descriptions: Record<string, string> = {}
  
  scenes.forEach((scene) => {
    if (scene.characterDescription && scene.characters) {
      // Get first character name
      const mainChar = scene.characters.split(/[、,，]/)[0].trim()
      if (mainChar && !descriptions[mainChar]) {
        descriptions[mainChar] = scene.characterDescription
      }
    }
  })
  
  return descriptions
}

/**
 * Get product info from parsed script
 */
export function getProductInfo(scriptContent: string): { name: string, description: string } {
  const productMatch = scriptContent.match(/【产品】(.+)/)
  const product = productMatch?.[1]?.trim() || ''
  
  // Try to find product description from scenes
  const productAppearances = scriptContent.match(/【产品展示】[：:]\s*(.+)/g)
  
  return {
    name: product,
    description: productAppearances?.join(' ').replace(/【产品展示】[：:]\s*/g, '') || ''
  }
}
