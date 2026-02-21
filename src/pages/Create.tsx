import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, ArrowRight, Upload, Image, Music, Mic, Sparkles, 
  Play, Pause, Check, ChevronRight, RotateCcw, Wand2,
  Clock, Zap, RefreshCw, Download, Share2, Heart, Star, Edit,
  Monitor, Smartphone, User, Package, X
} from 'lucide-react'
import { useStore } from '../store'
import { generateAdScript, type JiaobengInput } from '../skills/jiaobeng'

// Step Indicator
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, title: '产品信息' },
    { num: 2, title: '故事设定' },
    { num: 3, title: '场景视听' },
    { num: 4, title: '内容创作' },
    { num: 5, title: '生成预览' }
  ]

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
            currentStep >= step.num 
              ? 'bg-gradient-to-r from-ambient-blue to-ambient-purple text-white shadow-soft' 
              : 'bg-luxury-800/50 text-luxury-400 backdrop-blur-sm border border-glass-border'
          }`}>
            {currentStep > step.num ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="w-5 h-5 flex items-center justify-center text-sm font-medium">
                {step.num}
              </span>
            )}
            <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
          </div>
          {idx < steps.length - 1 && (
            <ChevronRight className="w-5 h-5 text-luxury-500 mx-1" />
          )}
        </div>
      ))}
    </div>
  )
}

// Step 2: Story Basic Settings
interface StepProps {
  onNext: () => void
  onPrev: () => void
  onSave: () => void
  type?: 'product' | 'brand' | 'promotion'
}

// Step 1: Character & Product (moved to first step)
function Step1CharacterProduct({ onNext, onPrev, onSave, type = 'product' }: StepProps) {
  const { storyConfig, updateStoryConfig } = useStore()

  // Product placement options for product ads
  const placementLevels = ['轻', '适度', '重度']

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
      {/* 产品信息 Section */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white">产品信息</h3>
          <p className="text-sm text-luxury-400">介绍你的产品特色和卖点</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 产品名称 & 调性 */}
          <div className="group bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-2 block">产品名称</label>
                <input
                  type="text"
                  value={storyConfig.productName}
                  onChange={(e) => updateStoryConfig({ productName: e.target.value })}
                  placeholder="输入产品名称..."
                  className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-2 block">产品调性</label>
                <input
                  type="text"
                  value={storyConfig.productTone}
                  onChange={(e) => updateStoryConfig({ productTone: e.target.value })}
                  placeholder="如：高端、时尚、温馨..."
                  className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
                />
              </div>
            </div>
          </div>
          
          {/* 产品描述 */}
          <div className="group bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-2 block">产品描述</label>
            <textarea
              value={storyConfig.productDescription}
              onChange={(e) => updateStoryConfig({ productDescription: e.target.value })}
              placeholder="输入产品特点、卖点..."
              className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all resize-none h-[calc(100%-2rem)]"
            />
          </div>
        </div>
        
        {/* 产品Logo & 图片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* 产品Logo */}
          <div className="group bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-4 block">产品Logo <span className="text-luxury-600">(jpg/png, ≤500KB)</span></label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-luxury-950/50 border-2 border-dashed border-white/10 group-hover:border-purple-400/50 overflow-hidden relative transition-all">
                {storyConfig.productLogo ? (
                  <>
                    <img src={storyConfig.productLogo} alt="Logo" className="w-full h-full object-cover" />
                    <button
                      onClick={() => updateStoryConfig({ productLogo: '' })}
                      className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-luxury-600" />
                  </div>
                )}
              </div>
              <label className="btn-primary cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {storyConfig.productLogo ? '更换Logo' : '上传Logo'}
                <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    if (file.size > 500 * 1024) {
                      alert('Logo图片大小不能超过500KB')
                      return
                    }
                    const reader = new FileReader()
                    reader.onload = () => updateStoryConfig({ productLogo: reader.result as string })
                    reader.readAsDataURL(file)
                  }
                }} />
              </label>
            </div>
          </div>
          
          {/* 产品图片 - 3张 */}
          <div className="group bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-4 block">产品图片 <span className="text-luxury-600">(jpg/png, ≤2M, 最多3张)</span></label>
            <div className="flex gap-3">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="w-24 h-24 rounded-xl bg-luxury-950/50 border-2 border-dashed border-white/10 group-hover:border-purple-400/50 overflow-hidden relative group flex-shrink-0 transition-all">
                  {storyConfig.productImages && storyConfig.productImages[idx] && storyConfig.productImages[idx] !== '' ? (
                    <>
                      <img src={storyConfig.productImages[idx]} alt={`产品${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          const newImages = storyConfig.productImages ? [...storyConfig.productImages] : []
                          newImages[idx] = ''
                          updateStoryConfig({ productImages: newImages })
                        }}
                        className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex items-center justify-center cursor-pointer">
                      <Upload className="w-6 h-6 text-luxury-600" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert('图片大小不能超过2MB')
                              return
                            }
                            const reader = new FileReader()
                            reader.onload = () => {
                              const newImages = [...(storyConfig.productImages || []), reader.result as string]
                              updateStoryConfig({ productImages: newImages.slice(0, 3) })
                            }
                            reader.readAsDataURL(file)
                          }
                        }} 
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 产品植入度 */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white">产品植入度</h3>
          <p className="text-sm text-luxury-400">控制产品在故事中的展示程度</p>
        </div>
        
        <div className="flex gap-4">
          {placementLevels.map((level) => (
            <button
              key={level}
              onClick={() => updateStoryConfig({ fusionLevel: level === '轻' ? 30 : level === '适度' ? 60 : 90 })}
              className={`flex-1 py-4 rounded-xl border-2 transition-all duration-300 ${
                (storyConfig.fusionLevel === 30 && level === '轻') ||
                (storyConfig.fusionLevel === 60 && level === '适度') ||
                (storyConfig.fusionLevel === 90 && level === '重度')
                  ? 'border-purple-400 bg-purple-500/20 text-white shadow-lg shadow-purple-500/20'
                  : 'border-white/10 bg-luxury-800/50 text-luxury-300 hover:border-purple-400/50 hover:bg-purple-500/10'
              }`}
            >
              <span className="text-lg font-semibold">{level}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={onNext} className="btn-primary flex items-center gap-2">下一步 <ArrowRight className="w-5 h-5" /></button>
      </div>
    </motion.div>
  )
}

// Step 2: Story Basic Settings
function Step1StoryBasic({ onNext, onPrev, onSave, type = 'product' }: StepProps) {
  const { storyConfig, updateStoryConfig } = useStore()

  const storyTypes = [
    { id: '不限', icon: '🌟' },
    { id: '剧情片', icon: '🎬' },
    { id: '喜剧片', icon: '😂' },
    { id: '动作片', icon: '💥' },
    { id: '爱情片', icon: '❤️' },
    { id: '恐怖片', icon: '👻' },
    { id: '科幻片', icon: '🚀' },
    { id: '奇幻片', icon: '✨' },
    { id: '犯罪片', icon: '🔍' },
    { id: '战争片', icon: '⚔️' },
    { id: '西部片', icon: '🤠' },
    { id: '歌舞片', icon: '💃' },
    { id: '悬疑片', icon: '❓' },
    { id: '冒险片', icon: '🏝️' },
  ]

  const durations = ['30s', '60s', '90s', '120s']
  const platforms = ['抖音', '快手', '视频号', 'B站']

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">选择故事类型</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {storyTypes.map(t => (
            <button key={t.id} onClick={() => updateStoryConfig({ storyType: t.id })} className={`card p-4 rounded-xl border-2 text-center transition-all hover:shadow-glow ${storyConfig.storyType === t.id ? 'border-ambient-blue bg-ambient-blue/10' : 'border-glass-border hover:border-ambient-blue/50'}`}>
              <span className="text-2xl block mb-1">{t.icon}</span>
              <span className="font-medium text-luxury-100">{t.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 角色设定 Section - Moved from Step 1 */}
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white">角色设定</h3>
          <p className="text-sm text-luxury-400">创建你的故事主角，最多3个角色</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((index) => (
            <div 
              key={index}
              className="group relative bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-5 border border-white/5 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
            >
              <div className="space-y-4">
                {/* 角色名称输入 */}
                <div>
                  <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-2 block">角色{index + 1}名称</label>
                  <input
                    type="text"
                    value={storyConfig.characterNames?.[index] || ''}
                    onChange={(e) => {
                      const newChars = storyConfig.characterNames ? [...storyConfig.characterNames] : Array(3).fill('')
                      newChars[index] = e.target.value
                      updateStoryConfig({ characterNames: newChars })
                    }}
                    placeholder={`角色${index + 1}名称`}
                    className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
                  />
                </div>
                
                {/* 角色描述 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider">角色{index + 1}描述</label>
                    <span className="text-xs text-luxury-500">{(storyConfig.characterDescriptions?.[index] || '').length}/100</span>
                  </div>
                  <textarea
                    value={storyConfig.characterDescriptions?.[index] || ''}
                    onChange={(e) => {
                      if (e.target.value.length <= 100) {
                        const newDescs = [...(storyConfig.characterDescriptions || Array(3).fill(''))]
                        newDescs[index] = e.target.value
                        updateStoryConfig({ characterDescriptions: newDescs })
                      }
                    }}
                    placeholder={`角色${index + 1}描述...`}
                    className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all resize-none h-20"
                    maxLength={100}
                  />
                </div>
                
                {/* 角色图片上传 - 大图预览 */}
                <div>
                  <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-2 block">角色{index + 1}形象</label>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-luxury-950/50 border-2 border-dashed border-white/10 group-hover:border-purple-400/50 focus-within:border-purple-400/50 transition-all">
                    {storyConfig.characterImages && storyConfig.characterImages[index] && storyConfig.characterImages[index] !== '' ? (
                      <>
                        <img src={storyConfig.characterImages[index]} alt={`角色${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const newImages = storyConfig.characterImages ? [...storyConfig.characterImages] : Array(3).fill('')
                            newImages[index] = ''
                            updateStoryConfig({ characterImages: newImages })
                          }}
                          className="absolute top-3 right-3 z-10 w-8 h-8 bg-red-500/90 hover:bg-red-500 rounded-full flex items-center justify-center opacity-100 transition-all transform hover:scale-110 shadow-lg"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-luxury-600">
                        <div className="w-16 h-16 rounded-full bg-luxury-800/50 flex items-center justify-center mb-3">
                          <User className="w-8 h-8" />
                        </div>
                        <span className="text-sm">上传角色图片</span>
                      </div>
                    )}
                    <label className="absolute inset-0 cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = () => {
                              const newImages = [...(storyConfig.characterImages || Array(3).fill(''))]
                              newImages[index] = reader.result as string
                              updateStoryConfig({ characterImages: newImages })
                            }
                            reader.readAsDataURL(file)
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">时长</h3>
        <div className="flex gap-3">
          {durations.map(d => (
            <button key={d} onClick={() => updateStoryConfig({ duration: d })} className={`px-6 py-3 rounded-xl border-2 transition-all ${storyConfig.duration === d ? 'border-ambient-cyan bg-ambient-cyan/10 text-white shadow-glow' : 'border-glass-border text-luxury-300 hover:border-ambient-cyan/50'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> 上一步</button>
        <div className="flex gap-2">
          <button onClick={onSave} className="btn-secondary flex items-center gap-2">保存项目</button>
          <button onClick={onNext} className="btn-primary flex items-center gap-2">下一步 <ArrowRight className="w-5 h-5" /></button>
        </div>
      </div>
    </motion.div>
  )
}

// Step 3: Scene & Audio
function Step2SceneAudio({ onNext, onPrev, onSave, type = 'product' }: StepProps) {
  const { storyConfig, updateStoryConfig } = useStore()
  const [tempScene, setTempScene] = useState('')
  const [tempStyle, setTempStyle] = useState('')
  const [sceneInputFocused, setSceneInputFocused] = useState(false)
  const [editStyle, setEditStyle] = useState(false)
  const [narratorEnabled, setNarratorEnabled] = useState(false)
  const [selectedNarrator, setSelectedNarrator] = useState<string>('')

  const scenes = ['不限', '室内', '户外', '都市', '乡村', '森林', '沙漠']
  const styles = ['写实', '动画', '赛博朋克', '水墨', '复古胶片', '唯美', '古风']
  const moods = ['欢快', '舒缓', '紧张', '温暖', '浪漫', '悬疑']
  const voices = [
    { id: 'none', name: '无旁白', style: '不需要' },
    { id: 'female', name: '女声', style: '温柔' },
    { id: 'male', name: '男声', style: '沉稳' },
    { id: 'child', name: '童声', style: '可爱' },
    { id: 'dialect', name: '方言', style: '亲切' },
    { id: 'english', name: '英语', style: '地道' }
  ]

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">主要场景</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          {scenes.map(scene => (
            <button 
              key={scene} 
              onClick={() => {
                // Toggle: if already selected, deselect
                if (storyConfig.scene === scene) {
                  updateStoryConfig({ scene: '' })
                } else {
                  updateStoryConfig({ scene, customScene: '' })
                  setTempScene('')
                }
              }} 
              className={`py-3 rounded-xl border-2 transition-all ${storyConfig.scene === scene ? 'border-ambient-blue bg-ambient-blue/10 text-white shadow-glow' : 'card border-glass-border text-luxury-300 hover:border-ambient-blue/50'}`}
            >
              <span className="text-luxury-100">{scene}</span>
            </button>
          ))}
        </div>
        <input 
          type="text" 
          value={tempScene}
          onChange={(e) => setTempScene(e.target.value)}
          onFocus={() => setSceneInputFocused(true)}
          onBlur={() => {
            setSceneInputFocused(false)
            if (tempScene.trim()) {
              updateStoryConfig({ customScene: tempScene.trim(), scene: '' })
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (tempScene.trim()) {
                updateStoryConfig({ customScene: tempScene.trim(), scene: '' })
              }
            }
          }}
          placeholder="或输入自定义场景..."
          className={`w-full bg-luxury-950/50 border rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none transition-all ${
            sceneInputFocused || tempScene
              ? 'border-ambient-blue bg-ambient-blue/10 shadow-glow' 
              : 'border-white/10'
          }`}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">视觉风格</h3>
        <div className="flex flex-wrap gap-2">
          {['动画', '写实'].map(style => (
            <button key={style} onClick={() => updateStoryConfig({ visualStyle: style, customVisualStyle: '' })} className={`px-4 py-2 rounded-full transition-all ${storyConfig.visualStyle === style ? 'bg-gradient-to-r from-ambient-blue to-ambient-purple text-white shadow-soft' : 'card border-glass-border text-luxury-300 hover:border-ambient-purple/50'}`}>
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* 旁白解说模式 */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold text-white">旁白解说模式</h3>
          <span className="text-xs text-luxury-500">默认为影视叙事模式</span>
          {/* Toggle switch */}
          <button
            onClick={() => {
              setNarratorEnabled(!narratorEnabled)
              if (narratorEnabled) {
                setSelectedNarrator('')
                updateStoryConfig({ voice: 'none' })
              }
            }}
            className={`relative w-12 h-6 rounded-full transition-colors ${narratorEnabled ? 'bg-ambient-purple' : 'bg-luxury-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${narratorEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
        
        {/* Show dropdown when toggle is on */}
        {narratorEnabled && (
          <div className="mb-4">
            <select
              value={selectedNarrator}
              onChange={(e) => {
                setSelectedNarrator(e.target.value)
                const voiceMap: Record<string, string> = {
                  '男': 'male',
                  '女': 'female',
                  '小孩': 'child',
                  '老人': 'elderly'
                }
                updateStoryConfig({ voice: voiceMap[e.target.value] || 'none' })
              }}
              className="w-full px-4 py-3 bg-luxury-800 border border-glass-border rounded-xl text-luxury-100 focus:outline-none focus:border-ambient-purple focus:ring-1 focus:ring-ambient-purple transition-all"
            >
              <option value="">请选择旁白声音</option>
              <option value="男">男</option>
              <option value="女">女</option>
              <option value="小孩">小孩</option>
              <option value="老人">老人</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">画面比例</h3>
        <div className="flex gap-4">
          <button
            onClick={() => updateStoryConfig({ aspectRatio: '16:9' })}
            className={`card p-4 rounded-xl border-2 transition-all hover:shadow-glow flex items-center gap-4 ${storyConfig.aspectRatio === '16:9' ? 'border-ambient-blue bg-ambient-blue/10 shadow-glow' : 'border-glass-border hover:border-ambient-blue/50'}`}
          >
            <div className="w-16 h-9 bg-luxury-800 rounded flex items-center justify-center">
              <Monitor className="w-6 h-6 text-luxury-400" />
            </div>
            <div className="text-left">
              <span className="font-medium text-luxury-100 block">16:9</span>
              <span className="text-xs text-luxury-500">横屏</span>
            </div>
          </button>
          <button
            onClick={() => updateStoryConfig({ aspectRatio: '9:16' })}
            className={`card p-4 rounded-xl border-2 transition-all hover:shadow-glow flex items-center gap-4 ${storyConfig.aspectRatio === '9:16' ? 'border-ambient-purple bg-ambient-purple/10 shadow-glow' : 'border-glass-border hover:border-ambient-purple/50'}`}
          >
            <div className="w-9 h-16 bg-luxury-800 rounded flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-luxury-400" />
            </div>
            <div className="text-left">
              <span className="font-medium text-luxury-100 block">9:16</span>
              <span className="text-xs text-luxury-500">竖屏</span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> 上一步</button>
        <div className="flex gap-2">
          <button onClick={onSave} className="btn-secondary flex items-center gap-2">保存项目</button>
          <button onClick={onNext} className="btn-primary flex items-center gap-2">下一步 <ArrowRight className="w-5 h-5" /></button>
        </div>
      </div>
    </motion.div>
  )
}

// Step 4: Story Content Creation
function Step3StoryContent({ onNext, onPrev, onSave }: StepProps) {
  const { storyConfig, updateStoryConfig } = useStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAICreating, setIsAICreating] = useState(false)
  const [generatedScripts, setGeneratedScripts] = useState<string[]>([])

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 2000)
  }

  const handleAICreateStory = async () => {
    setIsAICreating(true)
    
    try {
      // 构建输入参数
      const input: JiaobengInput = {
        adCoreConcept: storyConfig.adCoreConcept || '',
        adEndingEmotion: storyConfig.adEndingEmotion || '',
        storyPrompt: storyConfig.storyPrompt || '',
        productName: storyConfig.productName || '',
        productTone: storyConfig.productTone || '',
        productDescription: storyConfig.productDescription || '',
        characterNames: storyConfig.characterNames || [],
        characterDescriptions: storyConfig.characterDescriptions || [],
        scene: storyConfig.scene || '不限',
        visualStyle: storyConfig.visualStyle || '动画',
        duration: storyConfig.duration || '30s',
        audienceGender: storyConfig.audienceGender || '不限',
        audienceAge: storyConfig.audienceAge || '不限'
      }
      
      // 调用 Jiaobeng skill 生成剧本
      const result = await generateAdScript(input)
      
      if (result.success && result.script) {
        setGeneratedScripts(prev => {
          if (prev.length === 0) {
            return [result.script!]
          }
          // Replace first script
          const newScripts = [...prev]
          newScripts[0] = result.script!
          return newScripts
        })
      } else {
        // 如果生成失败，使用fallback
        console.error('剧本生成失败:', result.error)
        alert('剧本生成失败，请重试')
      }
    } catch (error) {
      console.error('调用Jiaobeng技能出错:', error)
      alert('生成剧本时发生错误')
    } finally {
      setIsAICreating(false)
    }
  }

  const handleDeleteScript = (index: number) => {
    setGeneratedScripts(prev => prev.filter((_, i) => i !== index))
  }

  const handleEditScript = (index: number, newContent: string) => {
    setGeneratedScripts(prev => prev.map((script, i) => i === index ? newContent : script))
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      {/* 广告核心创作概念 & 广告结尾希望表达的情绪 - 同一行 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 广告核心创作概念 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-white">广告核心创作概念</h3>
            <span className="text-xs text-luxury-500">{(storyConfig.adCoreConcept || '').length}/30</span>
          </div>
          <input
            type="text"
            value={storyConfig.adCoreConcept || ''}
            onChange={(e) => {
              if (e.target.value.length <= 30) {
                updateStoryConfig({ adCoreConcept: e.target.value })
              }
            }}
            placeholder="输入广告核心创作概念..."
            maxLength={30}
            className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
          />
        </div>

        {/* 广告结尾希望表达的情绪 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-white">广告结尾希望表达的情绪</h3>
            <span className="text-xs text-luxury-500">{(storyConfig.adEndingEmotion || '').length}/20</span>
          </div>
          <input
            type="text"
            value={storyConfig.adEndingEmotion || ''}
            onChange={(e) => {
              if (e.target.value.length <= 20) {
                updateStoryConfig({ adEndingEmotion: e.target.value })
              }
            }}
            placeholder="输入广告结尾希望表达的情绪..."
            maxLength={20}
            className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
          />
        </div>
      </div>

      {/* 广告故事要点 */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">广告故事要点</h3>
        <input 
          type="text"
          value={storyConfig.storyPrompt} 
          onChange={(e) => updateStoryConfig({ storyPrompt: e.target.value })} 
          placeholder="输入广告故事要点..." 
          className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
        />
      </div>

      {/* 广告剧本 - 始终显示 */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">广告剧本</h3>
        
        {/* 主输入框 - 增加高度 */}
        <div className="relative">
          <textarea
            value={generatedScripts.length > 0 ? generatedScripts[0] : ''}
            onChange={(e) => handleEditScript(0, e.target.value)}
            placeholder="输入或编辑广告剧本..."
            className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all resize-none h-[500px] pr-24"
          />
          <button 
            onClick={handleAICreateStory} 
            disabled={isAICreating} 
            className="absolute bottom-4 right-4 btn-primary flex items-center gap-2 text-base px-6 py-2"
          >
            {isAICreating ? <><RefreshCw className="w-4 h-4 animate-spin" />生成中...</> : <><Sparkles className="w-4 h-4" />AI创作剧本</>}
          </button>
        </div>
        
        {/* 剧本列表 */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {generatedScripts.length > 1 ? (
            generatedScripts.slice(1).map((script, index) => (
              <div key={index + 1} className="relative group">
                <textarea
                  value={script}
                  onChange={(e) => handleEditScript(index + 1, e.target.value)}
                  className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all resize-none h-24"
                />
                <button
                  onClick={() => handleDeleteScript(index + 1)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))
          ) : null}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> 上一步</button>
        <div className="flex gap-2">
          <button onClick={onSave} className="btn-secondary flex items-center gap-2">保存项目</button>
          <button 
            onClick={onNext} 
            disabled={!generatedScripts[0] || generatedScripts[0].trim() === ''}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              generatedScripts[0] && generatedScripts[0].trim() !== ''
                ? 'bg-gradient-to-r from-ambient-blue to-ambient-purple text-white shadow-glow hover:shadow-lg'
                : 'bg-luxury-700 text-luxury-500 cursor-not-allowed'
            }`}
          >
            下一步 <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Step 5: Generation & Preview
function Step4Generation({ onPrev, onSave }: StepProps) {
  const { storyConfig } = useStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleGenerate = () => {
    setIsGenerating(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          return 100
        }
        return prev + 2
      })
    }, 200)
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div className="card border-glass-border p-6">
        <h3 className="text-lg font-semibold text-white mb-4">创作配置摘要</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div><span className="text-luxury-400">故事类型：</span><span className="text-luxury-100 font-medium">{storyConfig.storyType || '-'}</span></div>
          <div><span className="text-luxury-400">目标时长：</span><span className="text-luxury-100 font-medium">{storyConfig.duration}</span></div>
          <div><span className="text-luxury-400">目标受众：</span><span className="text-luxury-100 font-medium">{storyConfig.audienceGender || '-'} {storyConfig.audienceAge || '-'}</span></div>
          <div><span className="text-luxury-400">视觉风格：</span><span className="text-luxury-100 font-medium">{storyConfig.visualStyle || '-'}</span></div>
          <div><span className="text-luxury-400">画面比例：</span><span className="text-luxury-100 font-medium">{storyConfig.aspectRatio}</span></div>
        </div>
      </div>

      <div className="text-center py-8">
        {!isGenerating && progress === 0 ? (
          <>
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-ambient-blue to-ambient-purple rounded-full flex items-center justify-center shadow-glow"><Zap className="w-12 h-12 text-white" /></div>
            <h3 className="text-2xl font-semibold text-white mb-2">准备就绪</h3>
            <p className="text-luxury-400 mb-6">点击开始生成您的专属广告视频</p>
            <button onClick={handleGenerate} className="btn-primary text-lg px-10 py-4">开始生成</button>
          </>
        ) : isGenerating ? (
          <>
            <div className="relative w-32 h-32 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-luxury-800" />
                <circle cx="64" cy="64" r="56" stroke="url(#gradient)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={351} strokeDashoffset={351 - (351 * progress) / 100} className="transition-all duration-200" />
                <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#4F46E5" /><stop offset="100%" stopColor="#7C3AED" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-2xl font-bold text-white">{progress}%</span></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">正在生成中...</h3>
            <p className="text-luxury-400 flex items-center justify-center gap-2"><Clock className="w-4 h-4" />预计剩余时间 3-5 分钟</p>
          </>
        ) : (
          <>
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-purple-600 rounded-full flex items-center justify-center shadow-soft"><Check className="w-12 h-12 text-white" /></div>
            <h3 className="text-2xl font-semibold text-white mb-2">生成完成！</h3>
            <p className="text-luxury-400 mb-6">您的广告视频已生成完毕</p>
            <div className="flex justify-center gap-4">
              <button className="btn-primary flex items-center gap-2"><Play className="w-5 h-5" />预览视频</button>
              <button className="btn-secondary flex items-center gap-2"><Download className="w-5 h-5" />下载</button>
              <button className="btn-secondary flex items-center gap-2"><Share2 className="w-5 h-5" />分享</button>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> 上一步</button>
        <button onClick={onSave} className="btn-primary flex items-center gap-2">保存项目</button>
      </div>
    </motion.div>
  )
}

// Main Create Page
interface CreateProps {
  type?: 'product' | 'brand' | 'promotion'
  title?: string
}

export default function Create({ type = 'product', title = '创作产品广告' }: CreateProps) {
  const navigate = useNavigate()
  const { currentStep, setCurrentStep, storyConfig, addProject, user } = useStore()

  // Get category based on type
  const getCategory = () => {
    switch (type) {
      case 'brand': return '品牌广告'
      case 'promotion': return '促销广告'
      default: return '产品广告'
    }
  }

  // Get default title based on type
  const getDefaultTitle = () => {
    switch (type) {
      case 'brand': return '未命名品牌广告'
      case 'promotion': return '未命名促销广告'
      default: return '未命名产品广告'
    }
  }

  const steps = [Step1CharacterProduct, Step1StoryBasic, Step2SceneAudio, Step3StoryContent, Step4Generation]
  const CurrentStepComponent = steps[currentStep - 1]

  const handleNext = () => { if (currentStep < 5) setCurrentStep(currentStep + 1) }
  const handlePrev = () => { if (currentStep > 1) setCurrentStep(currentStep - 1) }

  // Handle save project
  const handleSaveProject = () => {
    const newProject = {
      id: Date.now().toString(),
      title: storyConfig.productName || getDefaultTitle(),
      thumbnail: storyConfig.productImages?.[0] || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop',
      author: user || { id: '1', name: '用户', avatar: 'https://i.pravatar.cc/100', level: 'bronze' as const, totalGenerations: 0, totalLikes: 0, totalViews: 0 },
      views: 0,
      likes: 0,
      favorites: 0,
      duration: storyConfig.duration || '30s',
      category: getCategory(),
      style: storyConfig.visualStyle || '默认',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'draft' as const
    }
    addProject(newProject)
    alert('项目已保存到个人中心')
    navigate('/profile')
  }

  return (
    <div className="min-h-screen bg-luxury-950">
      <div className="absolute inset-0 bg-ambient-gradient opacity-30" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-ambient-blue/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-ambient-purple/5 rounded-full blur-[100px]" />
      </div>
      
      <header className="relative glass sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-glass-light rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-luxury-300" /></button>
            <h1 className="text-xl font-semibold text-white">{title}</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <StepIndicator currentStep={currentStep} />
        <div className="card border-glass-border p-8">
          <AnimatePresence mode="wait">
            <CurrentStepComponent key={currentStep} onNext={handleNext} onPrev={handlePrev} onSave={handleSaveProject} type={type} />
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
