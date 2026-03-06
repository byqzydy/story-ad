/**
 * 需求验证脚本
 * 用于验证用户输入的有效性
 */

export interface ValidationResult {
  valid: boolean
  error?: string
  suggestion?: string
}

export function validateAdType(input: string): ValidationResult {
  const validTypes = ['产品广告', '品牌广告', '促销广告']
  if (validTypes.some(t => input.includes(t))) {
    return { valid: true }
  }
  return {
    valid: false,
    error: '请选择有效的广告类型',
    suggestion: '产品广告 / 品牌广告 / 促销广告'
  }
}

export function validateProductDescription(input: string): ValidationResult {
  if (!input || input.trim().length < 10) {
    return {
      valid: false,
      error: '产品描述过于简短',
      suggestion: '请提供至少10个字符的产品描述，包含产品名称和核心功能'
    }
  }
  if (input.length > 500) {
    return {
      valid: false,
      error: '产品描述过长',
      suggestion: '请将描述控制在500字以内'
    }
  }
  return { valid: true }
}

export function validateStoryType(input: string): ValidationResult {
  const validTypes = [
    '不限', '科幻', '爱情', '悬疑', '恐怖', '动作', '喜剧',
    '战争', '西部', '奇幻', '歌舞', '冒险', '公路', '犯罪', '剧情'
  ]
  if (validTypes.some(t => input.includes(t))) {
    return { valid: true }
  }
  return {
    valid: false,
    error: '请选择有效的故事类型',
    suggestion: validTypes.join(' / ')
  }
}

export function validateDuration(input: string): ValidationResult {
  const validDurations = ['15s', '30s', '60s', '90s', '120s']
  if (validDurations.some(d => input.includes(d))) {
    return { valid: true }
  }
  return {
    valid: false,
    error: '请选择有效的时长',
    suggestion: '15s / 30s / 60s / 90s / 120s'
  }
}

export function validateAspectRatio(input: string): ValidationResult {
  const validRatios = ['16:9', '9:16', '横屏', '竖屏']
  if (validRatios.some(r => input.includes(r))) {
    return { valid: true }
  }
  return {
    valid: false,
    error: '请选择有效的画面比例',
    suggestion: '16:9 横屏 / 9:16 竖屏'
  }
}

export function validateAll(
  collectedInfo: Record<string, string>
): { valid: boolean; missing: string[] } {
  const required = ['adType', 'productDescription', 'storyType']
  const missing = required.filter(k => !collectedInfo[k])
  
  return {
    valid: missing.length === 0,
    missing
  }
}
