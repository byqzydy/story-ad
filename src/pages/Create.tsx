import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, ArrowRight, Upload, Image, Music, Mic, Sparkles, 
  Play, Pause, Check, ChevronRight, RotateCcw, Wand2,
  Clock, Zap, RefreshCw, Download, Share2, Heart, Star
} from 'lucide-react'
import { useStore } from '../store'

// Step Indicator
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, title: '故事设定' },
    { num: 2, title: '角色产品' },
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

// Step 1: Story Basic Settings
function Step1StoryBasic({ onNext }: { onNext: () => void }) {
  const { storyConfig, updateStoryConfig } = useStore()

  const storyTypes = [
    { id: '情感共鸣', icon: '❤️', sub: ['亲情故事', '爱情故事', '友情岁月', '宠物情缘'] },
    { id: '问题解决', icon: '💡', sub: ['痛点场景', '对比测评', '使用教程'] },
    { id: '梦想励志', icon: '🚀', sub: ['创业故事', '成长蜕变', '挑战突破'] },
    { id: '节日营销', icon: '🎉', sub: ['春节团圆', '情人节礼物', '母亲节感恩', '双十一狂欢'] },
  ]

  const durations = ['15s', '30s', '60s']
  const platforms = ['抖音', '快手', '视频号', '小红书', 'B站', '淘宝']

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">选择故事类型</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {storyTypes.map(type => (
            <button
              key={type.id}
              onClick={() => updateStoryConfig({ storyType: type.id })}
              className={`card p-4 text-left transition-all hover:border-ambient-blue/50 hover:shadow-glow ${
                storyConfig.storyType === type.id
                  ? 'border-ambient-blue bg-ambient-blue/10 shadow-glow'
                  : 'border-glass-border'
              }`}
            >
              <span className="text-2xl mb-2 block">{type.icon}</span>
              <span className="font-medium text-luxury-100">{type.id}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">目标时长</h3>
        <div className="flex gap-3">
          {durations.map(dur => (
            <button
              key={dur}
              onClick={() => updateStoryConfig({ duration: dur })}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                storyConfig.duration === dur
                  ? 'bg-gradient-to-r from-ambient-blue to-ambient-purple text-white shadow-soft'
                  : 'card border-glass-border text-luxury-300 hover:border-ambient-blue/50'
              }`}
            >
              {dur}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">目标平台</h3>
        <div className="flex flex-wrap gap-2">
          {platforms.map(platform => (
            <button
              key={platform}
              onClick={() => {
                const newPlatforms = storyConfig.platforms.includes(platform)
                  ? storyConfig.platforms.filter(p => p !== platform)
                  : [...storyConfig.platforms, platform]
                updateStoryConfig({ platforms: newPlatforms })
              }}
              className={`px-4 py-2 rounded-full transition-all ${
                storyConfig.platforms.includes(platform)
                  ? 'bg-gradient-to-r from-ambient-blue to-ambient-purple text-white shadow-soft'
                  : 'card border-glass-border text-luxury-300 hover:border-ambient-blue/50'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onNext} className="btn-primary flex items-center gap-2">
          下一步 <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}

// Step 2: Character & Product
function Step2CharacterProduct({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { storyConfig, updateStoryConfig } = useStore()

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">故事主角（可选）</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {/* 角色1 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-luxury-300">角色1</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card border-2 border-dashed border-glass-border hover:border-ambient-blue/50 transition-colors cursor-pointer relative group">
                {storyConfig.characterImage ? (
                  <div className="relative">
                    <img src={storyConfig.characterImage} alt="character1" className="w-32 h-32 mx-auto rounded-xl object-cover" />
                    <button onClick={() => updateStoryConfig({ characterImage: null })} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">×</button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-luxury-500 mx-auto mb-3" />
                    <p className="text-luxury-400 text-sm">上传角色照片</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) updateStoryConfig({ characterImage: URL.createObjectURL(file) })
                }} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div>
                <textarea value={storyConfig.character} onChange={(e) => updateStoryConfig({ character: e.target.value })} placeholder="描述角色1特点..." className="input-field h-24 resize-none text-sm" />
                <div className="flex items-center gap-2 text-ambient-blue mt-2"><Sparkles className="w-4 h-4" /><span className="text-xs text-luxury-400">或描述角色，AI自动生成</span></div>
              </div>
            </div>
          </div>

          {/* 角色2 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-luxury-300">角色2</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card border-2 border-dashed border-glass-border hover:border-ambient-purple/50 transition-colors cursor-pointer relative group">
                {storyConfig.characterImage2 ? (
                  <div className="relative">
                    <img src={storyConfig.characterImage2} alt="character2" className="w-32 h-32 mx-auto rounded-xl object-cover" />
                    <button onClick={() => updateStoryConfig({ characterImage2: null })} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">×</button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-luxury-500 mx-auto mb-3" />
                    <p className="text-luxury-400 text-sm">上传角色照片</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) updateStoryConfig({ characterImage2: URL.createObjectURL(file) })
                }} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div>
                <textarea value={storyConfig.character2} onChange={(e) => updateStoryConfig({ character2: e.target.value })} placeholder="描述角色2特点..." className="input-field h-24 resize-none text-sm" />
                <div className="flex items-center gap-2 text-ambient-blue mt-2"><Sparkles className="w-4 h-4" /><span className="text-xs text-luxury-400">或描述角色，AI自动生成</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">产品信息</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card border-2 border-dashed border-glass-border hover:border-ambient-purple/50 transition-colors cursor-pointer relative group">
            {storyConfig.productImage ? (
              <div className="relative">
                <img src={storyConfig.productImage} alt="product" className="w-32 h-32 mx-auto rounded-xl object-contain bg-luxury-900" />
                <button onClick={() => updateStoryConfig({ productImage: null })} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">×</button>
              </div>
            ) : (
              <>
                <Image className="w-12 h-12 text-luxury-500 mx-auto mb-3" />
                <p className="text-luxury-400 mb-2">上传产品图片</p>
              </>
            )}
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) updateStoryConfig({ productImage: URL.createObjectURL(file) })
            }} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-luxury-300 mb-2">产品名称</label>
              <input type="text" value={storyConfig.productName} onChange={(e) => updateStoryConfig({ productName: e.target.value })} placeholder="请输入产品名称" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-luxury-300 mb-2">产品卖点</label>
              <textarea value={storyConfig.productDescription} onChange={(e) => updateStoryConfig({ productDescription: e.target.value })} placeholder="描述产品卖点..." className="input-field h-24 resize-none" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">产品融合度</h3>
        <div className="flex items-center gap-4">
          <span className="text-luxury-400">自然植入</span>
          <input type="range" min="0" max="100" value={storyConfig.fusionLevel} onChange={(e) => updateStoryConfig({ fusionLevel: parseInt(e.target.value) })} className="flex-1 h-2 bg-luxury-800 rounded-full" />
          <span className="text-luxury-400">强调展示</span>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> 上一步</button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">下一步 <ArrowRight className="w-5 h-5" /></button>
      </div>
    </motion.div>
  )
}

// Step 3: Scene & Audio
function Step3SceneAudio({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { storyConfig, updateStoryConfig } = useStore()

  const scenes = ['室内', '户外', '科幻', '古风', '都市', '乡村']
  const styles = ['写实', '动画', '赛博朋克', '水墨', '复古胶片', '唯美']
  const moods = ['欢快', '舒缓', '紧张', '温暖', '浪漫', '悬疑']
  const voices = [
    { id: 'female', name: '女声', style: '温柔' },
    { id: 'male', name: '男声', style: '沉稳' },
    { id: 'child', name: '童声', style: '可爱' },
    { id: 'dialect', name: '方言', style: '亲切' },
    { id: 'english', name: '英语', style: '地道' }
  ]

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">场景设定</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {scenes.map(scene => (
            <button key={scene} onClick={() => updateStoryConfig({ scene })} className={`py-3 rounded-xl border-2 transition-all ${storyConfig.scene === scene ? 'border-ambient-blue bg-ambient-blue/10 text-white shadow-glow' : 'card border-glass-border text-luxury-300 hover:border-ambient-blue/50'}`}>
              <span className="text-luxury-100">{scene}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">视觉风格</h3>
        <div className="flex flex-wrap gap-2">
          {styles.map(style => (
            <button key={style} onClick={() => updateStoryConfig({ visualStyle: style })} className={`px-4 py-2 rounded-full transition-all ${storyConfig.visualStyle === style ? 'bg-gradient-to-r from-ambient-blue to-ambient-purple text-white shadow-soft' : 'card border-glass-border text-luxury-300 hover:border-ambient-purple/50'}`}>
              {style}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">背景音乐</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {moods.map(mood => (
            <button key={mood} onClick={() => updateStoryConfig({ music: mood })} className={`px-4 py-2 rounded-full transition-all ${storyConfig.music === mood ? 'bg-gradient-to-r from-ambient-cyan to-ambient-purple text-white shadow-soft' : 'card border-glass-border text-luxury-300 hover:border-ambient-cyan/50'}`}>
              {mood}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-ambient-cyan"><Music className="w-4 h-4" /><span className="text-sm text-luxury-400">1000+版权音乐可选</span></div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">配音设定</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {voices.map(voice => (
            <button key={voice.id} onClick={() => updateStoryConfig({ voice: voice.id })} className={`card p-4 rounded-xl border-2 text-center transition-all hover:shadow-glow ${storyConfig.voice === voice.id ? 'border-ambient-purple bg-ambient-purple/10' : 'border-glass-border hover:border-ambient-purple/50'}`}>
              <Mic className="w-6 h-6 mx-auto mb-2 text-luxury-400" />
              <span className="font-medium text-luxury-100">{voice.name}</span>
              <span className="text-xs text-luxury-500 block">{voice.style}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> 上一步</button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">下一步 <ArrowRight className="w-5 h-5" /></button>
      </div>
    </motion.div>
  )
}

// Step 4: Story Content Creation
function Step4StoryContent({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { storyConfig, updateStoryConfig } = useStore()
  const [mode, setMode] = useState<'ai' | 'manual'>('ai')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 2000)
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">创作模式</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button onClick={() => setMode('ai')} className={`card p-6 text-left transition-all hover:border-ambient-blue/50 hover:shadow-glow ${mode === 'ai' ? 'border-ambient-blue bg-ambient-blue/10 shadow-glow' : 'border-glass-border'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-ambient-blue/20 rounded-xl flex items-center justify-center"><Wand2 className="w-5 h-5 text-ambient-blue" /></div>
              <span className="font-semibold text-luxury-100">AI全自动</span>
            </div>
            <p className="text-luxury-400 text-sm">输入核心卖点，AI自动生成完整故事脚本</p>
          </button>
          <button onClick={() => setMode('manual')} className={`card p-6 text-left transition-all hover:border-ambient-purple/50 hover:shadow-glow ${mode === 'manual' ? 'border-ambient-purple bg-ambient-purple/10 shadow-glow' : 'border-glass-border'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-ambient-purple/20 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-ambient-purple" /></div>
              <span className="font-semibold text-luxury-100">专业编辑</span>
            </div>
            <p className="text-luxury-400 text-sm">可视化分镜时间轴，完全掌控每个细节</p>
          </button>
        </div>
      </div>

      {mode === 'ai' && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">输入故事要点</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-luxury-300 mb-2">核心卖点</label>
              <textarea value={storyConfig.storyPrompt} onChange={(e) => updateStoryConfig({ storyPrompt: e.target.value })} placeholder="描述产品的核心卖点..." className="input-field h-24 resize-none" />
            </div>
            <button onClick={handleGenerate} disabled={isGenerating || !storyConfig.storyPrompt} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" />AI创作中...</> : <><Wand2 className="w-5 h-5" />生成故事脚本</>}
            </button>
          </div>
        </div>
      )}

      {mode === 'manual' && (
        <div className="card border-glass-border p-6"><p className="text-luxury-400 text-center py-8">分镜编辑器开发中，敬请期待...</p></div>
      )}

      <div className="flex justify-between">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> 上一步</button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">下一步 <ArrowRight className="w-5 h-5" /></button>
      </div>
    </motion.div>
  )
}

// Step 5: Generation & Preview
function Step5Generation({ onPrev }: { onPrev: () => void }) {
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
          <div><span className="text-luxury-400">目标平台：</span><span className="text-luxury-100 font-medium">{storyConfig.platforms.join(', ') || '-'}</span></div>
          <div><span className="text-luxury-400">视觉风格：</span><span className="text-luxury-100 font-medium">{storyConfig.visualStyle || '-'}</span></div>
          <div><span className="text-luxury-400">配音：</span><span className="text-luxury-100 font-medium">{storyConfig.voice}</span></div>
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
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-soft"><Check className="w-12 h-12 text-white" /></div>
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

      <div className="flex justify-start">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> 上一步</button>
      </div>
    </motion.div>
  )
}

// Main Create Page
export default function Create() {
  const navigate = useNavigate()
  const { currentStep, setCurrentStep } = useStore()

  const steps = [Step1StoryBasic, Step2CharacterProduct, Step3SceneAudio, Step4StoryContent, Step5Generation]
  const CurrentStepComponent = steps[currentStep - 1]

  const handleNext = () => { if (currentStep < 5) setCurrentStep(currentStep + 1) }
  const handlePrev = () => { if (currentStep > 1) setCurrentStep(currentStep - 1) }

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
            <h1 className="text-xl font-semibold text-white">创作广告</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <StepIndicator currentStep={currentStep} />
        <div className="card border-glass-border p-8">
          <AnimatePresence mode="wait">
            <CurrentStepComponent key={currentStep} onNext={handleNext} onPrev={handlePrev} />
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
