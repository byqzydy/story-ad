import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Clock, Image, FileText, Play, Users, 
  Sparkles, Palette, Volume2, Edit3, Trash2, Maximize2
} from 'lucide-react'
import { useStore } from '../store'
import type { AIProject } from '../store'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { aiProjects, updateStoryConfig, setCurrentStep } = useStore()
  const [project, setProject] = useState<AIProject | null>(null)

  useEffect(() => {
    if (id) {
      const found = aiProjects.find(p => p.id === id)
      if (found) {
        setProject(found)
      } else {
        // Project not found, redirect to profile
        navigate('/profile')
      }
    }
  }, [id, aiProjects, navigate])

  if (!project) {
    return (
      <div className="min-h-screen bg-luxury-950 flex items-center justify-center">
        <div className="text-luxury-400">加载中...</div>
      </div>
    )
  }

  // 恢复项目状态并跳转到创作页面（自由混合模式）
  const handleContinueEditing = () => {
    if (project.storyConfig) {
      updateStoryConfig(project.storyConfig)
    }
    if (project.currentStep) {
      setCurrentStep(project.currentStep)
    }
    // 跳转到自由混合模式广告创作页继续创作
    navigate(`/create-product?projectId=${project.id}`)
  }

  // 解析时长显示
  const getDurationDisplay = (duration: string | undefined) => {
    if (!duration) return '未设置'
    return duration
  }

  return (
    <div className="min-h-screen bg-luxury-950">
      <div className="absolute inset-0 bg-ambient-gradient opacity-20" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-ambient-blue/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-ambient-purple/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-glass-light rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-luxury-300" />
            </button>
            <h1 className="text-xl font-semibold text-white">项目详情</h1>
          </div>
          <button 
            onClick={handleContinueEditing}
            className="btn-primary flex items-center gap-2"
          >
            <Edit3 className="w-5 h-5" />
            继续编辑
          </button>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Project Cover & Basic Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover */}
            <div className="w-full md:w-80 aspect-video bg-luxury-800 rounded-xl overflow-hidden">
              <img 
                src={project.thumbnail || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400'} 
                alt={project.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">{project.name}</h2>
                <div className="flex items-center gap-4 text-sm text-luxury-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    创建于 {project.createdAt}
                  </span>
                  {project.updatedAt && (
                    <span className="flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4" />
                      更新于 {project.updatedAt}
                    </span>
                  )}
                </div>
              </div>

              {/* Story Type Badge */}
              {project.storyConfig?.storyType && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                    {project.storyConfig.storyType}
                  </span>
                  <span className="px-3 py-1 bg-luxury-700 text-luxury-300 rounded-full text-sm">
                    {getDurationDisplay(project.storyConfig.duration)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Continue Editing Button - Prominent */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <button 
            onClick={handleContinueEditing}
            className="w-full flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-ambient-blue to-ambient-purple text-white rounded-xl hover:opacity-90 transition-opacity group"
          >
            <Play className="w-6 h-6" />
            <span className="text-lg font-medium">继续编辑</span>
            <span className="text-sm opacity-70">从上次保存的状态继续</span>
          </button>
        </motion.div>

        {/* Assets Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-lg font-medium text-white mb-6">项目资源</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Brand Logo */}
            <div className="bg-luxury-900/50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-luxury-300 mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" /> 品牌Logo
              </h4>
              {project.assets?.productLogo ? (
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-luxury-600">
                  <img src={project.assets.productLogo} alt="Logo" className="w-full h-full object-contain bg-luxury-800" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-luxury-600 flex items-center justify-center">
                  <span className="text-xs text-luxury-500">未上传</span>
                </div>
              )}
            </div>

            {/* Product Images */}
            <div className="bg-luxury-900/50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-luxury-300 mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" /> 产品图片 ({project.assets?.productImages?.length || 0}/3)
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.assets?.productImages?.map((img, index) => (
                  <div key={index} className="w-20 h-20 rounded-lg overflow-hidden border border-luxury-600">
                    <img src={img} alt={`产品${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {(!project.assets?.productImages || project.assets.productImages.length === 0) && (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-luxury-600 flex items-center justify-center">
                    <span className="text-xs text-luxury-500">暂无</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scripts */}
            <div className="md:col-span-2 bg-luxury-900/50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-luxury-300 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> 剧本文件
              </h4>
              <div className="space-y-2">
                {project.assets?.scripts?.map((script, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-luxury-800 rounded-lg">
                    <FileText className="w-5 h-5 text-luxury-400" />
                    <span className="flex-1 text-sm text-luxury-300 truncate">{script.name}</span>
                  </div>
                ))}
                {(!project.assets?.scripts || project.assets.scripts.length === 0) && (
                  <div className="text-sm text-luxury-500">暂无剧本文件</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Story Config Section */}
        {project.storyConfig && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h3 className="text-lg font-medium text-white mb-6">创作配置</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Story Type */}
              <div className="bg-luxury-900/50 rounded-xl p-4">
                <h4 className="text-xs text-luxury-500 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 故事类型
                </h4>
                <p className="text-luxury-100">{project.storyConfig.storyType || '未设置'}</p>
              </div>

              {/* Ad Type */}
              <div className="bg-luxury-900/50 rounded-xl p-4">
                <h4 className="text-xs text-luxury-500 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> 广告类型
                </h4>
                <p className="text-luxury-100">{project.storyConfig.adType || '未设置'}</p>
              </div>

              {/* Audience */}
              <div className="bg-luxury-900/50 rounded-xl p-4">
                <h4 className="text-xs text-luxury-500 mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> 目标受众
                </h4>
                <p className="text-luxury-100">
                  {project.storyConfig.audienceGender === 'male' ? '男性' : 
                   project.storyConfig.audienceGender === 'female' ? '女性' : '通用'} / 
                  {project.storyConfig.audienceAge || '未设置'}
                </p>
              </div>

              {/* Duration */}
              <div className="bg-luxury-900/50 rounded-xl p-4">
                <h4 className="text-xs text-luxury-500 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> 时长
                </h4>
                <p className="text-luxury-100">{getDurationDisplay(project.storyConfig.duration)}</p>
              </div>

              {/* Scene */}
              <div className="md:col-span-2 bg-luxury-900/50 rounded-xl p-4">
                <h4 className="text-xs text-luxury-500 mb-2">场景</h4>
                <p className="text-luxury-100">
                  {project.storyConfig.scene === 'custom' 
                    ? project.storyConfig.customScene 
                    : project.storyConfig.scene || '未设置'}
                </p>
              </div>

              {/* Visual Style */}
              <div className="md:col-span-2 bg-luxury-900/50 rounded-xl p-4">
                <h4 className="text-xs text-luxury-500 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> 视觉风格
                </h4>
                <p className="text-luxury-100">
                  {project.storyConfig.visualStyle === 'custom'
                    ? (project.storyConfig as any).customVisualStyle || '未设置'
                    : project.storyConfig.visualStyle || '未设置'}
                </p>
              </div>

              {/* Voice */}
              <div className="bg-luxury-900/50 rounded-xl p-4">
                <h4 className="text-xs text-luxury-500 mb-2 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" /> 配音
                </h4>
                <p className="text-luxury-100">
                  {project.storyConfig.voice === 'custom'
                    ? (project.storyConfig as any).voiceStyle || '未设置'
                    : project.storyConfig.voice || '未设置'}
                </p>
              </div>

              {/* Aspect Ratio */}
              <div className="bg-luxury-900/50 rounded-xl p-4">
                <h4 className="text-xs text-luxury-500 mb-2 flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" /> 画面比例
                </h4>
                <p className="text-luxury-100">{project.storyConfig.aspectRatio || '未设置'}</p>
              </div>

              {/* Product Info */}
              <div className="bg-luxury-900/50 rounded-xl p-4">
                <h4 className="text-xs text-luxury-500 mb-2">产品名称</h4>
                <p className="text-luxury-100">{project.storyConfig.productName || '未设置'}</p>
              </div>

              <div className="bg-luxury-900/50 rounded-xl p-4">
                <h4 className="text-xs text-luxury-500 mb-2">产品调性</h4>
                <p className="text-luxury-100">{project.storyConfig.productTone || '未设置'}</p>
              </div>

              {/* Core Concept */}
              <div className="md:col-span-2 bg-luxury-900/50 rounded-xl p-4">
                <h4 className="text-xs text-luxury-500 mb-2">核心创作理念</h4>
                <p className="text-luxury-100">{project.storyConfig.adCoreConcept || '未设置'}</p>
              </div>

              {/* Ending Emotion */}
              <div className="md:col-span-2 bg-luxury-900/50 rounded-xl p-4">
                <h4 className="text-xs text-luxury-500 mb-2">结尾情绪</h4>
                <p className="text-luxury-100">{project.storyConfig.adEndingEmotion || '未设置'}</p>
              </div>

              {/* Characters */}
              {project.storyConfig?.characterNames && project.storyConfig.characterNames.length > 0 && (
                <div className="md:col-span-2 bg-luxury-900/50 rounded-xl p-4">
                  <h4 className="text-xs text-luxury-500 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> 角色
                  </h4>
                  <div className="space-y-2">
                    {project.storyConfig?.characterNames.map((name, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-luxury-100 font-medium">{name}</span>
                        {project.storyConfig?.characterDescriptions?.[index] && (
                          <span className="text-luxury-500 text-sm">- {project.storyConfig?.characterDescriptions?.[index]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platforms */}
              {project.storyConfig?.platforms && project.storyConfig.platforms.length > 0 && (
                <div className="md:col-span-2 bg-luxury-900/50 rounded-xl p-4">
                  <h4 className="text-xs text-luxury-500 mb-2">投放平台</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.storyConfig.platforms.map((platform, index) => (
                      <span key={index} className="px-2 py-1 bg-luxury-700 text-luxury-300 rounded text-sm">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Generated Script Preview */}
        {project.storyConfig?.generatedScript && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="text-lg font-medium text-white mb-4">已生成的剧本</h3>
            <div className="bg-luxury-900/50 rounded-xl p-4 max-h-64 overflow-y-auto">
              <p className="text-luxury-300 text-sm whitespace-pre-wrap">{project.storyConfig.generatedScript}</p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
