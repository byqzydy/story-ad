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
  clipIndex: number  // 0, 1, 2... for scenes split into multiple clips
  startTime: number
  endTime: number
  prompt: string     // Full prompt for Dream AI
  aspectRatio: string
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
  
  // Parse scenes
  const sceneRegex = /【场景(\d+)】(.+?)\s*\((\d+)-(\d+)秒\)([\s\S]*?)(?=【场景\d+】|【广告词】|$)/g
  let sceneMatch
  
  while ((sceneMatch = sceneRegex.exec(scriptContent)) !== null) {
    const [, sceneNum, title, startStr, endStr, content] = sceneMatch
    const startTime = parseInt(startStr)
    const endTime = parseInt(endStr)
    
    // Extract fields from scene content
    const timeMatch = content.match(/【时间】[：:]\s*(\d+:\d+)-(\d+:\d+)/)
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
 * Split scenes into video clips of max 15 seconds each
 */
function splitIntoClips(scenes: Scene[], aspectRatio: string): VideoClip[] {
  const clips: VideoClip[] = []
  const MAX_CLIP_DURATION = 15
  
  scenes.forEach((scene) => {
    const duration = scene.endTime - scene.startTime
    
    if (duration <= MAX_CLIP_DURATION) {
      // Scene fits in one clip
      clips.push({
        id: `${scene.id}_clip_0`,
        sceneId: scene.id,
        clipIndex: 0,
        startTime: scene.startTime,
        endTime: scene.endTime,
        prompt: buildPrompt(scene, aspectRatio),
        aspectRatio
      })
    } else {
      // Need to split scene into multiple clips
      const clipCount = Math.ceil(duration / MAX_CLIP_DURATION)
      const timePerClip = duration / clipCount
      
      for (let i = 0; i < clipCount; i++) {
        const clipStartTime = scene.startTime + (i * timePerClip)
        const clipEndTime = Math.min(clipStartTime + timePerClip, scene.endTime)
        
        clips.push({
          id: `${scene.id}_clip_${i}`,
          sceneId: scene.id,
          clipIndex: i,
          startTime: Math.round(clipStartTime),
          endTime: Math.round(clipEndTime),
          prompt: buildSplitPrompt(scene, aspectRatio, i, clipCount, clipStartTime, clipEndTime),
          aspectRatio
        })
      }
    }
  })
  
  return clips
}

/**
 * Build prompt for a single scene clip
 */
function buildPrompt(scene: Scene, aspectRatio: string): string {
  const parts: string[] = []
  
  // Aspect ratio
  parts.push(`[画幅比例: ${aspectRatio}]`)
  
  // Character description (for consistency)
  if (scene.characterDescription) {
    parts.push(`[人物描写: ${scene.characterDescription}]`)
  }
  
  // Location and setting
  if (scene.location) {
    parts.push(`[场景地点: ${scene.location}]`)
  }
  
  // Visual description
  if (scene.visualDescription) {
    parts.push(`[画面描述: ${scene.visualDescription}]`)
  }
  
  // Dialogue
  if (scene.dialogue) {
    parts.push(`[对话: ${scene.dialogue}]`)
  }
  
  return parts.join('\n')
}

/**
 * Build prompt for a split scene clip
 * Includes reference to previous clips for consistency
 */
function buildSplitPrompt(
  scene: Scene, 
  aspectRatio: string, 
  clipIndex: number, 
  totalClips: number,
  startTime: number,
  endTime: number
): string {
  const parts: string[] = []
  
  // Aspect ratio
  parts.push(`[画幅比例: ${aspectRatio}]`)
  
  // Clip info
  parts.push(`[片段 ${clipIndex + 1}/${totalClips}, 时长: ${Math.round(endTime - startTime)}秒]`)
  
  // Character description (for consistency across clips)
  if (scene.characterDescription) {
    parts.push(`[人物描写: ${scene.characterDescription}]`)
  }
  
  // Location
  if (scene.location) {
    parts.push(`[场景地点: ${scene.location}]`)
  }
  
  // Visual description with time context
  const visualWithTime = scene.visualDescription.replace(
    /(\d+)-(\d+)秒/,
    `${Math.round(startTime)}-${Math.round(endTime)}秒`
  )
  parts.push(`[画面描述: ${visualWithTime}]`)
  
  // Dialogue (may need to split by time)
  if (scene.dialogue) {
    parts.push(`[对话: ${scene.dialogue}]`)
  }
  
  // Add continuity note for split clips
  if (totalClips > 1) {
    parts.push(`[重要: 这是场景"${scene.title}"的第${clipIndex + 1}个片段，请保持画面、人物、服装、场景与上一片段完全一致，确保视频连贯性]`)
  }
  
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
