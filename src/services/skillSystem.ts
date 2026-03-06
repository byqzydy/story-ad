/**
 * Skill 管理系统
 * 
 * 实现 Skills 懒加载机制：
 * 1. 启动时只加载 Skills 元数据（轻量级）
 * 2. 当需要使用某个 Skill 时，才加载完整内容
 * 3. 执行过程中按需加载 scripts 和 resources
 */

import { knowledgeBase, type RAGResult } from './agentSystem'

// 导出 RAGResult 类型（从 agentSystem 导入）
export type { RAGResult } from './agentSystem'

// ============== 类型定义 ==============

export interface SkillMetadata {
  name: string
  description: string
  version: string
  author: string
  tags: string[]
  // 轻量级：只有名称和描述时才加载
  loaded?: boolean
}

export interface Skill {
  metadata: SkillMetadata
  // 懒加载内容
  systemPrompt?: string
  resources?: Record<string, string>
  templates?: Record<string, string>
  // 脚本需要时动态导入
  scripts?: Record<string, any>
}

// ============== Skill 基础路径 ==============

const SKILL_BASE_PATH = '/src/skills'

// ============== Skill 注册表 ==============

class SkillRegistry {
  private skills: Map<string, SkillMetadata> = new Map()
  private loadedSkills: Map<string, Skill> = new Map()
  
  constructor() {
    this.registerDefaultSkills()
  }
  
  // 注册默认 Skills（轻量级，只加载元数据）
  private registerDefaultSkills() {
    // 需求收集师
    this.register({
      name: 'requirements_collector',
      description: '专业的广告需求分析师，通过结构化对话收集用户的产品信息、创作意图和广告规格要求',
      version: '1.0.0',
      author: '虹忆坊',
      tags: ['需求收集', '广告', '对话']
    })
    
    // 创意总监
    this.register({
      name: 'creative_director',
      description: '专精广告创意策划，根据需求生成完整的广告创意方案',
      version: '1.0.0',
      author: '虹忆坊',
      tags: ['创意', '广告', '策划', '导演']
    })
    
    // 编剧
    this.register({
      name: 'screenwriter',
      description: '专业的广告剧本写手，生成吸引人的广告脚本',
      version: '1.0.0',
      author: '虹忆坊',
      tags: ['编剧', '剧本', '脚本']
    })
    
    // 分镜设计师
    this.register({
      name: 'storyboard_designer',
      description: '生成分镜脚本，包括每个镜头的画面、时长、运镜等',
      version: '1.0.0',
      author: '虹忆坊',
      tags: ['分镜', '脚本', '镜头']
    })
    
    // 角色设计师
    this.register({
      name: 'character_designer',
      description: '设计广告中的角色形象，包括外观、性格、背景',
      version: '1.0.0',
      author: '虹忆坊',
      tags: ['角色', '设计', '形象']
    })
  }
  
  // 注册 Skill（轻量级）
  register(metadata: SkillMetadata) {
    this.skills.set(metadata.name, metadata)
  }
  
  // 获取所有 Skills 元数据（轻量级扫描）
  getAllMetadata(): SkillMetadata[] {
    return Array.from(this.skills.values())
  }
  
  // 获取单个 Skill 元数据
  getMetadata(name: string): SkillMetadata | undefined {
    return this.skills.get(name)
  }
  
  // 懒加载完整 Skill
  async loadSkill(name: string): Promise<Skill | null> {
    // 检查是否已加载
    if (this.loadedSkills.has(name)) {
      return this.loadedSkills.get(name)!
    }
    
    // 动态加载 Skill 内容
    try {
      const skill = await this.loadSkillContent(name)
      if (skill) {
        this.loadedSkills.set(name, skill)
        // 更新元数据标记为已加载
        const meta = this.skills.get(name)
        if (meta) meta.loaded = true
      }
      return skill
    } catch (error) {
      console.error(`[SkillRegistry] Failed to load skill ${name}:`, error)
      return null
    }
  }
  
  // 加载 Skill 完整内容
  private async loadSkillContent(name: string): Promise<Skill | null> {
    const metadata = this.skills.get(name)
    if (!metadata) return null
    
    const skill: Skill = { metadata }
    
    // 动态导入 SKILL.md
    try {
      const skillModule = await import(`../skills/${name}/SKILL.md?raw`)
      skill.systemPrompt = this.parseSkillPrompt(skillModule.default || skillModule)
    } catch (e) {
      console.warn(`[SkillRegistry] No SKILL.md for ${name}`)
    }
    
    // 动态导入 resources（按需）
    skill.resources = {}
    try {
      const resources = await import(`../skills/${name}/resources`)
      // 遍历 resources 目录下的所有 .md 文件
      for (const key of Object.keys(resources)) {
        if (key.endsWith('.md') || key.endsWith('.json')) {
          skill.resources[key] = resources[key]?.default || resources[key]
        }
      }
    } catch (e) {
      // resources 可选
    }
    
    // 动态导入 templates
    skill.templates = {}
    try {
      const templates = await import(`../skills/${name}/templates`)
      for (const key of Object.keys(templates)) {
        if (key.endsWith('.md') || key.endsWith('.json')) {
          skill.templates[key] = templates[key]?.default || templates[key]
        }
      }
    } catch (e) {
      // templates 可选
    }
    
    return skill
  }
  
  // 解析 SKILL.md 为 System Prompt
  private parseSkillPrompt(content: string): string {
    // 提取 YAML 头部之后的内容作为 prompt
    const parts = content.split('---')
    if (parts.length >= 3) {
      // 跳过 YAML 头部，返回正文
      return parts.slice(2).join('---').trim()
    }
    return content
  }
  
  // 动态加载脚本（按需）
  async loadScript(name: string, scriptName: string): Promise<any> {
    try {
      const script = await import(`../skills/${name}/scripts/${scriptName}`)
      return script.default || script
    } catch (error) {
      console.error(`[SkillRegistry] Failed to load script ${name}/${scriptName}:`, error)
      return null
    }
  }
  
  // 搜索 Skills（基于元数据）
  search(query: string): SkillMetadata[] {
    const q = query.toLowerCase()
    return Array.from(this.skills.values()).filter(skill => 
      skill.name.toLowerCase().includes(q) ||
      skill.description.toLowerCase().includes(q) ||
      skill.tags.some(t => t.toLowerCase().includes(q))
    )
  }
}

// ============== 全局 Skill 注册表 ==============

export const skillRegistry = new SkillRegistry()

// ============== Skill 使用函数 ==============

/**
 * 获取 Skill System Prompt（懒加载）
 */
export async function getSkillPrompt(name: string): Promise<string | null> {
  const skill = await skillRegistry.loadSkill(name)
  return skill?.systemPrompt || null
}

/**
 * 获取 Skill 资源
 */
export async function getSkillResource(name: string, resourceName: string): Promise<string | null> {
  const skill = await skillRegistry.loadSkill(name)
  return skill?.resources?.[resourceName] || null
}

/**
 * 获取 Skill 模板
 */
export async function getSkillTemplate(name: string, templateName: string): Promise<string | null> {
  const skill = await skillRegistry.loadSkill(name)
  return skill?.templates?.[templateName] || null
}

/**
 * 执行 Skill 脚本
 */
export async function executeSkillScript(
  skillName: string, 
  scriptName: string, 
  ...args: any[]
): Promise<any> {
  const script = await skillRegistry.loadScript(skillName, scriptName)
  if (!script) {
    throw new Error(`Script ${skillName}/${scriptName} not found`)
  }
  return script(...args)
}

/**
 * 列出所有可用 Skills（轻量级）
 */
export function listSkills(): SkillMetadata[] {
  return skillRegistry.getAllMetadata()
}

/**
 * 搜索 Skills
 */
export function searchSkills(query: string): SkillMetadata[] {
  return skillRegistry.search(query)
}

// ============== 便捷函数：使用 Knowledge Base ==============

/**
 * 搜索知识库（整合 Skill resources）
 */
export async function searchWithSkill(
  skillName: string,
  query: string,
  options?: { categories?: string[]; tags?: string[]; limit?: number }
): Promise<RAGResult> {
  // 加载 Skill 的 resources
  const skill = await skillRegistry.loadSkill(skillName)
  
  // 优先搜索 Skill 专属资源
  if (skill?.resources) {
    // 可以将 resources 合并到知识库
    // 这里简化处理，直接使用通用知识库
  }
  
  return knowledgeBase.query(query, options)
}
