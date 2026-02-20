import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, ArrowRight, Upload, Image, Music, Mic, Sparkles, 
  Play, Pause, Check, ChevronRight, RotateCcw, Wand2,
  Clock, Zap, RefreshCw, Download, Share2, Heart, Star, Edit,
  Monitor, Smartphone, User, Package
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
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
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
        <h3 className="text-lg font-semibold text-white mb-4">目标受众</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-luxury-400 mb-2 block">性别</label>
            <div className="flex gap-2">
              {['不限', '男性', '女性'].map(gender => (
                <button key={gender} onClick={() => updateStoryConfig({ audienceGender: gender })} className={`flex-1 py-2 rounded-lg border-2 transition-all ${storyConfig.audienceGender === gender ? 'border-ambient-blue bg-ambient-blue/10 text-white' : 'card border-glass-border text-luxury-300 hover:border-ambient-blue/50'}`}>
                  {gender}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-luxury-400 mb-2 block">年龄段</label>
            <div className="flex gap-2">
              {['不限', '18-25', '26-35', '36-45', '46+'].map(age => (
                <button key={age} onClick={() => updateStoryConfig({ audienceAge: age })} className={`flex-1 py-2 rounded-lg border-2 transition-all ${storyConfig.audienceAge === age ? 'border-ambient-purple bg-ambient-purple/10 text-white' : 'card border-glass-border text-luxury-300 hover:border-ambient-purple/50'}`}>
                  {age}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">时长</h3>
        <div className="flex gap-2">
          {durations.map(d => (
            <button key={d} onClick={() => updateStoryConfig({ duration: d })} className={`px-6 py-3 rounded-xl border-2 transition-all ${storyConfig.duration === d ? 'border-ambient-cyan bg-ambient-cyan/10 text-white shadow-glow' : 'card border-glass-border text-luxury-300 hover:border-ambient-cyan/50'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">发布平台</h3>
        <div className="flex flex-wrap gap-2">
          {platforms.map(p => (
            <button key={p} onClick={() => {
              const current = storyConfig.platforms || []
              const newPlatforms = current.includes(p) ? current.filter(x => x !== p) : [...current, p]
              updateStoryConfig({ platforms: newPlatforms })
            }} className={`px-4 py-2 rounded-full transition-all ${(storyConfig.platforms || []).includes(p) ? 'bg-gradient-to-r from-ambient-green to-ambient-cyan text-white' : 'card border-glass-border text-luxury-300 hover:border-ambient-green/50'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onNext} className="btn-primary flex items-center gap-2">下一步 <ArrowRight className="w-5 h-5" /></button>
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
        <h3 className="text-lg font-semibold text-white mb-4">角色设定</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Character 1 */}
          <div className="card border-glass-border p-4 rounded-xl">
            <label className="text-sm text-luxury-400 mb-2 block">主角</label>
            <input
              type="text"
              value={storyConfig.character}
              onChange={(e) => updateStoryConfig({ character: e.target.value })}
              placeholder="输入角色名称或描述..."
              className="input-field mb-3"
            />
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-luxury-800 border-2 border-dashed border-luxury-600 flex items-center justify-center overflow-hidden">
                {storyConfig.characterImage ? (
                  <img src={storyConfig.characterImage} alt="角色" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-luxury-500" />
                )}
              </div>
              <label className="btn-secondary cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                上传图片
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = () => updateStoryConfig({ characterImage: reader.result as string })
                    reader.readAsDataURL(file)
                  }
                }} />
              </label>
            </div>
          </div>

          {/* Character 2 */}
          <div className="card border-glass-border p-4 rounded-xl">
            <label className="text-sm text-luxury-400 mb-2 block">配角</label>
            <input
              type="text"
              value={storyConfig.character2}
              onChange={(e) => updateStoryConfig({ character2: e.target.value })}
              placeholder="输入角色名称或描述..."
              className="input-field mb-3"
            />
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-luxury-800 border-2 border-dashed border-luxury-600 flex items-center justify-center overflow-hidden">
                {storyConfig.characterImage2 ? (
                  <img src={storyConfig.characterImage2} alt="角色" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-luxury-500" />
                )}
              </div>
              <label className="btn-secondary cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                上传图片
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = () => updateStoryConfig({ characterImage2: reader.result as string })
                    reader.readAsDataURL(file)
                  }
                }} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">产品信息</h3>
        <div className="card border-glass-border p-4 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-luxury-400 mb-2 block">产品名称</label>
              <input
                type="text"
                value={storyConfig.productName}
                onChange={(e) => updateStoryConfig({ productName: e.target.value })}
                placeholder="输入产品名称..."
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-luxury-400 mb-2 block">产品调性</label>
              <input
                type="text"
                value={storyConfig.productTone}
                onChange={(e) => updateStoryConfig({ productTone: e.target.value })}
                placeholder="如：高端、时尚、温馨..."
                className="input-field"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-luxury-400 mb-2 block">产品Logo (jpg/png, ≤500KB)</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-luxury-800 border-2 border-dashed border-luxury-600 flex items-center justify-center overflow-hidden">
                  {storyConfig.productLogo ? (
                    <img src={storyConfig.productLogo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-luxury-500" />
                  )}
                </div>
                <label className="btn-secondary cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  上传Logo
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
            <div>
              <label className="text-sm text-luxury-400 mb-2 block">产品图片 (jpg/png, ≤2M, 最多3张)</label>
              <div className="flex gap-2">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="w-16 h-16 rounded-lg bg-luxury-800 border-2 border-dashed border-luxury-600 flex items-center justify-center overflow-hidden relative hover:border-ambient-blue hover:bg-luxury-700 transition-all cursor-pointer">
                    {storyConfig.productImages?.[index] ? (
                      <>
                        <img src={storyConfig.productImages[index]} alt={`产品${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => {
                            const newImages = [...(storyConfig.productImages || [])]
                            newImages.splice(index, 1)
                            updateStoryConfig({ productImages: newImages })
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer w-full h-full flex items-center justify-center">
                        <Upload className="w-5 h-5 text-luxury-500" />
                        <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert('产品图片大小不能超过2MB')
                              return
                            }
                            const currentImages = storyConfig.productImages || []
                            if (currentImages.length >= 3) {
                              alert('最多只能上传3张产品图片')
                              return
                            }
                            const reader = new FileReader()
                            reader.onload = () => {
                              updateStoryConfig({ productImages: [...currentImages, reader.result as string] })
                            }
                            reader.readAsDataURL(file)
                          }
                        }} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-luxury-400 mb-2 block">产品描述</label>
            <textarea
              value={storyConfig.productDescription}
              onChange={(e) => updateStoryConfig({ productDescription: e.target.value })}
              placeholder="输入产品特点、卖点..."
              className="input-field h-24 resize-none"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">角色与产品融合度</h3>
        <div className="card border-glass-border p-4 rounded-xl">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-luxury-400">自然</span>
            <input
              type="range"
              min="0"
              max="100"
              value={storyConfig.fusionLevel}
              onChange={(e) => updateStoryConfig({ fusionLevel: parseInt(e.target.value) })}
              className="flex-1 h-2 bg-luxury-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-luxury-400">强植入</span>
          </div>
          <div className="text-center text-ambient-purple font-medium">{storyConfig.fusionLevel}%</div>
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
function Step2SceneAudio({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { storyConfig, updateStoryConfig } = useStore()
  const [tempScene, setTempScene] = useState('')
  const [tempStyle, setTempStyle] = useState('')
  const [editScene, setEditScene] = useState(false)
  const [editStyle, setEditStyle] = useState(false)

  const scenes = ['室内', '户外', '都市', '乡村', '森林', '沙漠']
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
        <h3 className="text-lg font-semibold text-white mb-4">场景设定</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          {scenes.map(scene => (
            <button key={scene} onClick={() => updateStoryConfig({ scene, customScene: '' })} className={`py-3 rounded-xl border-2 transition-all ${storyConfig.scene === scene ? 'border-ambient-blue bg-ambient-blue/10 text-white shadow-glow' : 'card border-glass-border text-luxury-300 hover:border-ambient-blue/50'}`}>
              <span className="text-luxury-100">{scene}</span>
            </button>
          ))}
        </div>
        {storyConfig.customScene && !editScene ? (
          <div className="flex items-center gap-2 p-3 bg-luxury-800/50 rounded-lg border border-ambient-blue/30">
            <span className="text-sm text-ambient-blue flex-1">{storyConfig.customScene}</span>
            <button onClick={() => { setTempScene(storyConfig.customScene); setEditScene(true) }} className="p-1 hover:bg-luxury-700 rounded">
              <Edit className="w-4 h-4 text-luxury-400" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input 
              type="text" 
              value={tempScene}
              onChange={(e) => setTempScene(e.target.value)}
              placeholder="或输入自定义场景..."
              className="input-field text-sm flex-1"
            />
            {tempScene && (
              <>
                <button 
                  onClick={() => { updateStoryConfig({ customScene: tempScene, scene: '' }); setTempScene(''); setEditScene(false) }}
                  className="px-3 py-2 bg-ambient-blue text-white rounded-lg text-sm hover:bg-ambient-blue/80"
                >
                  确认
                </button>
                <button 
                  onClick={() => { setTempScene(''); setEditScene(false) }}
                  className="px-3 py-2 bg-luxury-700 text-luxury-300 rounded-lg text-sm hover:bg-luxury-600"
                >
                  取消
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">视觉风格</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {styles.map(style => (
            <button key={style} onClick={() => updateStoryConfig({ visualStyle: style, customVisualStyle: '' })} className={`px-4 py-2 rounded-full transition-all ${storyConfig.visualStyle === style ? 'bg-gradient-to-r from-ambient-blue to-ambient-purple text-white shadow-soft' : 'card border-glass-border text-luxury-300 hover:border-ambient-purple/50'}`}>
              {style}
            </button>
          ))}
        </div>
        {storyConfig.customVisualStyle && !editStyle ? (
          <div className="flex items-center gap-2 p-3 bg-luxury-800/50 rounded-lg border border-ambient-purple/30">
            <span className="text-sm text-ambient-purple flex-1">{storyConfig.customVisualStyle}</span>
            <button onClick={() => { setTempStyle(storyConfig.customVisualStyle); setEditStyle(true) }} className="p-1 hover:bg-luxury-700 rounded">
              <Edit className="w-4 h-4 text-luxury-400" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input 
              type="text" 
              value={tempStyle}
              onChange={(e) => setTempStyle(e.target.value)}
              placeholder="或输入自定义风格..."
              className="input-field text-sm flex-1"
            />
            {tempStyle && (
              <>
                <button 
                  onClick={() => { updateStoryConfig({ customVisualStyle: tempStyle, visualStyle: '' }); setTempStyle(''); setEditStyle(false) }}
                  className="px-3 py-2 bg-ambient-purple text-white rounded-lg text-sm hover:bg-ambient-purple/80"
                >
                  确认
                </button>
                <button 
                  onClick={() => { setTempStyle(''); setEditStyle(false) }}
                  className="px-3 py-2 bg-luxury-700 text-luxury-300 rounded-lg text-sm hover:bg-luxury-600"
                >
                  取消
                </button>
              </>
            )}
          </div>
        )}
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
        <h3 className="text-lg font-semibold text-white mb-4">旁白设定</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
          {voices.map(voice => (
            <button key={voice.id} onClick={() => updateStoryConfig({ voice: voice.id })} className={`card p-4 rounded-xl border-2 text-center transition-all hover:shadow-glow ${storyConfig.voice === voice.id ? 'border-ambient-purple bg-ambient-purple/10' : 'border-glass-border hover:border-ambient-purple/50'}`}>
              <Mic className="w-6 h-6 mx-auto mb-2 text-luxury-400" />
              <span className="font-medium text-luxury-100">{voice.name}</span>
              <span className="text-xs text-luxury-500 block">{voice.style}</span>
            </button>
          ))}
        </div>
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
        <button onClick={onNext} className="btn-primary flex items-center gap-2">下一步 <ArrowRight className="w-5 h-5" /></button>
      </div>
    </motion.div>
  )
}

// Step 4: Story Content Creation
function Step3StoryContent({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { storyConfig, updateStoryConfig } = useStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAICreating, setIsAICreating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 2000)
  }

  const handleAICreateStory = () => {
    setIsAICreating(true)
    setTimeout(() => {
      // Mock AI generated story content
      const aiStory = "在一个繁忙的都市里，主人公小李偶然间发现了一款改变生活的产品..."
      updateStoryConfig({ storyPrompt: aiStory })
      setIsAICreating(false)
    }, 2000)
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">输入故事要点</h3>
        <div className="space-y-4">
          <textarea 
            value={storyConfig.storyPrompt} 
            onChange={(e) => updateStoryConfig({ storyPrompt: e.target.value })} 
            placeholder="输入您的故事" 
            className="input-field h-64 resize-none" 
          />
          <div className="flex gap-4">
            <button onClick={handleAICreateStory} disabled={isAICreating} className="btn-secondary flex items-center gap-2">
              {isAICreating ? <><RefreshCw className="w-5 h-5 animate-spin" />AI创作中...</> : <><Sparkles className="w-5 h-5" />AI创作故事</>}
            </button>
            <button onClick={handleGenerate} disabled={isGenerating || !storyConfig.storyPrompt} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" />AI完善中...</> : <><Wand2 className="w-5 h-5" />AI完善故事</>}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> 上一步</button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">下一步 <ArrowRight className="w-5 h-5" /></button>
      </div>
    </motion.div>
  )
}

// Step 5: Generation & Preview
function Step4Generation({ onPrev }: { onPrev: () => void }) {
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

  const steps = [Step1StoryBasic, Step2CharacterProduct, Step2SceneAudio, Step3StoryContent, Step4Generation]
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
