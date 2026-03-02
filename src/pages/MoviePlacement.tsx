import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Sparkles, Upload, Package, X, ArrowLeft, 
  Clock, Monitor, Smartphone, Wand2, Crown, User, LogOut,
  Clapperboard, Film, Video, Loader2, Bot, Pencil, Play, Layers, Download, Check, Save
} from 'lucide-react'
import { useStore } from '../store'
import { generateScript } from '../services/scriptGenerator'
import type { MovieInfo } from '../services/movieService'
import { parseScript, extractCharacterDescriptions, type VideoClip } from '../services/sceneSegmentation'
import { createVideoTask, getVideoTask, type VideoTask } from '../services/videoTaskService'
import Logo from '../components/Logo'

const movieTypes = [
  { id: 'action', name: '动作片', icon: '🎬' },
  { id: 'comedy', name: '喜剧片', icon: '😂' },
  { id: 'romance', name: '爱情片', icon: '💕' },
  { id: 'sci-fi', name: '科幻片', icon: '🚀' },
  { id: 'fantasy', name: '奇幻片', icon: '✨' },
  { id: 'drama', name: '剧情片', icon: '🎭' },
  { id: 'horror', name: '恐怖片', icon: '👻' },
  { id: 'animation', name: '动画片', icon: '🎨' },
]

const durations = [
  { value: '15', label: '15秒', desc: '短视频，适合社交媒体' },
  { value: '30', label: '30秒', desc: '标准短视频' },
  { value: '60', label: '60秒', desc: '中等时长' },
  { value: '90', label: '90秒', desc: '较长内容' },
  { value: '120', label: '120秒', desc: '完整故事' },
]

const aspectRatios = [
  { value: '16:9', label: '16:9', icon: Monitor, desc: '横屏 - 电视/电脑' },
  { value: '9:16', label: '9:16', icon: Smartphone, desc: '竖屏 - 手机短视频' },
  { value: '1:1', label: '1:1', icon: Film, desc: '方形 - 社交媒体' },
  { value: '4:3', label: '4:3', icon: Video, desc: '经典比例' },
]

const sampleMovies: Record<string, string[]> = {
  action: ['速度与激情', '黑客帝国', '碟中谍', '虎胆龙威', '壮志凌云'],
  comedy: ['周星驰系列', '人在囧途', '疯狂的石头', '夏洛特烦恼', '西虹市首富'],
  romance: ['泰坦尼克号', '罗马假日', '恋恋笔记本', '情书', '爱情公寓'],
  'sci-fi': ['星球大战', '黑客帝国', '盗梦空间', '流浪地球', '阿凡达'],
  fantasy: ['哈利波特', '指环王', '纳尼亚传奇', '捉妖记', '哪吒之魔童降世'],
  drama: ['肖申克的救赎', '阿甘正传', '霸王别姬', '我不是药神', '你好，李焕英'],
  horror: ['招魂', '寂静之地', '生化危机', '山村老尸', '午夜凶铃'],
  animation: ['冰雪奇缘', '千与千寻', '疯狂动物城', '哪吒之魔童降世', '大鱼海棠'],
}

interface ProductInfo {
  name: string
  description: string
  images: string[]
  logo: string
}

const stepLabels = ['产品信息', '电影设定', '剧本确认', '视频预览']

export default function MoviePlacement() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isLoggedIn, logout, setShowLoginModal, movieProjects, addMovieProject, updateMovieProject } = useStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // Current project ID (for editing existing project)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Load existing project if projectId is in URL
  useEffect(() => {
    const projectId = searchParams.get('projectId')
    if (projectId) {
      const project = movieProjects.find(p => p.id === projectId)
      if (project) {
        setCurrentProjectId(project.id)
        // Restore project state
        setProductInfo(project.productInfo)
        setSelectedMovieType(project.movieType)
        setSpecificMovie(project.movieName)
        setCustomMovie(project.customMovie)
        setDuration(project.duration)
        setAspectRatio(project.aspectRatio)
        setScriptContent(project.script)
        setStep(project.currentStep || 1)
        if (project.videoTaskId) {
          setCurrentTaskId(project.videoTaskId)
        }
      }
    }
  }, [searchParams, movieProjects])
  
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    name: '',
    description: '',
    images: [],
    logo: ''
  })
  const [selectedMovieType, setSelectedMovieType] = useState('')
  const [specificMovie, setSpecificMovie] = useState('')
  const [customMovie, setCustomMovie] = useState('')
  const [duration, setDuration] = useState('30')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [step, setStep] = useState(1)
  const [currentStep, setCurrentStep] = useState(0)
  const [scriptContent, setScriptContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStatus, setCurrentStatus] = useState('')
  const [movieInfo, setMovieInfo] = useState<MovieInfo | null>(null)
  
  // Script editing state
  const [isEditingScript, setIsEditingScript] = useState(false)
  const [scriptEdited, setScriptEdited] = useState(false)
  const [tempScriptContent, setTempScriptContent] = useState('')
  // Video generation state
  const [videoClips, setVideoClips] = useState<VideoClip[]>([])
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [currentTask, setCurrentTask] = useState<VideoTask | null>(null)
  const [videoGenerationProgress, setVideoGenerationProgress] = useState(0)
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false)
  const [characterDescriptions, setCharacterDescriptions] = useState<Record<string, string>>({})
  const [parsedScript, setParsedScript] = useState<ReturnType<typeof parseScript> | null>(null)

  // Poll for task status every 30 seconds
  useEffect(() => {
    if (!currentTaskId || !isGeneratingVideos) return
    
    const pollInterval = setInterval(async () => {
      try {
        const task = await getVideoTask(currentTaskId)
        setCurrentTask(task)
        
        // Calculate progress
        const completed = task.clips.filter(c => c.status === 'completed').length
        const total = task.clips.length
        setVideoGenerationProgress(Math.round((completed / total) * 100))
        
        // Update current status
        const processing = task.clips.find(c => c.status === 'processing')
        const failed = task.clips.find(c => c.status === 'failed')
        
        if (task.status === 'completed') {
          setIsGeneratingVideos(false)
          setCurrentStatus(`✅ 全部视频生成完成！共 ${completed} 个片段`)
        } else if (task.status === 'failed') {
          setIsGeneratingVideos(false)
          setCurrentStatus('❌ 视频生成失败')
        } else if (processing) {
          setCurrentStatus(`正在生成片段 ${processing.index + 1}/${total}...`)
        } else if (failed) {
          setCurrentStatus(`⚠️ 片段 ${failed.index + 1} 生成失败`)
        }
      } catch (error) {
        console.error('Error polling task:', error)
      }
    }, 30000)
    
    return () => clearInterval(pollInterval)
  }, [currentTaskId, isGeneratingVideos])

  // Save project function
  const handleSaveProject = async () => {
    const projectName = productInfo.name || specificMovie || customMovie || '未命名项目'
    
    const projectData = {
      name: projectName,
      productInfo: {
        name: productInfo.name,
        description: productInfo.description,
        images: productInfo.images,
        logo: productInfo.logo
      },
      movieType: selectedMovieType,
      movieName: specificMovie,
      customMovie: customMovie,
      duration: duration,
      aspectRatio: aspectRatio,
      script: scriptContent,
      currentStep: step,
      videoTaskId: currentTaskId || undefined
    }

    setIsSaving(true)
    
    try {
      if (currentProjectId) {
        // Update existing project
        updateMovieProject(currentProjectId, projectData)
        alert('项目已更新保存！')
      } else {
        // Create new project
        const newProject = {
          ...projectData,
          id: `movie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        addMovieProject(newProject)
        setCurrentProjectId(newProject.id)
        alert('项目已保存！')
      }
    } catch (error) {
      console.error('Failed to save project:', error)
      alert('保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const newImages = [...productInfo.images]
        newImages[index] = reader.result as string
        setProductInfo({ ...productInfo, images: newImages.slice(0, 3) })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...productInfo.images]
    newImages[index] = ''
    setProductInfo({ ...productInfo, images: newImages })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 500 * 1024) {
        alert('Logo图片大小不能超过500KB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setProductInfo({ ...productInfo, logo: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStartVideoGeneration = async () => {
    if (!scriptContent) return
    
    const parsed = parseScript(scriptContent, aspectRatio)
    setParsedScript(parsed)
    setVideoClips(parsed.clips)
    
    const chars = extractCharacterDescriptions(parsed.scenes)
    setCharacterDescriptions(chars)
    
    // Create task name
    const movieName = specificMovie || customMovie
    const taskName = `${productInfo.name || '产品'}-${movieName}-${new Date().toLocaleString('zh-CN')}`
    
    setStep(4)
    setIsGeneratingVideos(true)
    setVideoGenerationProgress(0)
    setCurrentTaskId(null)
    setCurrentTask(null)
    
    setCurrentStatus('正在创建视频生成任务...')
    
    try {
      // Create video task on backend
      const task = await createVideoTask({
        name: taskName,
        productName: productInfo.name,
        productDescription: productInfo.description,
        productImages: productInfo.images,
        productLogo: productInfo.logo,
        movieName: movieName,
        movieType: selectedMovieType,
        duration: duration,
        aspectRatio: aspectRatio,
        script: scriptContent,
        clips: parsed.clips.map((clip, index) => ({
          index,
          prompt: clip.prompt,
          startTime: clip.startTime,
          endTime: clip.endTime
        }))
      })
      
      setCurrentTaskId(task.id)
      setCurrentTask(task)
      setCurrentStatus('任务已提交，等待生成中...')
      setVideoGenerationProgress(0)
    } catch (error) {
      console.error('Failed to create video task:', error)
      setCurrentStatus('❌ 创建视频任务失败')
      setIsGeneratingVideos(false)
    }
  }

  const handleSubmit = async () => {
    if (!productInfo.images || productInfo.images.length === 0 || !productInfo.images.some(img => img)) {
      alert('请上传产品图片（必填）')
      return
    }
    if (!productInfo.description || productInfo.description.trim() === '') {
      alert('请填写产品描述（必填）')
      return
    }
    if (!selectedMovieType || (!specificMovie && !customMovie)) {
      alert('请选择电影')
      return
    }
    
    const movieName = specificMovie || customMovie
    
    setStep(3)
    setIsGenerating(true)
    setScriptContent('')
    setCurrentStep(0)
    setCurrentStatus(`正在搜索电影 "${movieName}"...`)
    
    const progressTexts = [
      `正在搜索电影 "${movieName}"...`,
      `正在获取电影故事简介...`,
      `正在分析经典角色...`,
      `正在提取经典桥段...`,
      `正在创作同人剧本...`,
      `正在生成剧本...`,
    ]
    
    let stepIndex = 0
    const progressInterval = setInterval(() => {
      if (stepIndex < 6) {
        setCurrentStep(stepIndex)
        setCurrentStatus(progressTexts[stepIndex])
        stepIndex++
      }
    }, 800)
    
    try {
      const result = await generateScript({
        productName: productInfo.name || '未命名产品',
        productDescription: productInfo.description,
        productImages: productInfo.images,
        movieName,
        movieType: selectedMovieType,
        duration: parseInt(duration),
        aspectRatio
      })
      
      clearInterval(progressInterval)
      
      setCurrentStep(6)
      setCurrentStatus('✅ 剧本完成')
      setScriptContent(result.script)
      setMovieInfo(result.movieInfo)
    } catch (error) {
      clearInterval(progressInterval)
      console.error('Script generation failed:', error)
      setCurrentStatus('❌ 剧本生成失败，请重试')
      alert('剧本生成失败，请稍后重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const movies = selectedMovieType ? sampleMovies[selectedMovieType] || [] : []
  const canProceedFromStep1 = productInfo.name && productInfo.description && productInfo.images.some(img => img)
  const progressPercent = (currentStep / 6) * 100

  return (
    <div className="min-h-screen bg-luxury-950">
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <Logo size="md" />

          <div className="flex items-center gap-1 p-1 bg-luxury-800/50 rounded-xl border border-glass-border">
            <button
              onClick={() => navigate('/create-guide')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-luxury-400 hover:text-white hover:bg-luxury-700"
            >
              <Layers className="w-4 h-4" />
              自由混合
            </button>
            <button
              onClick={() => navigate('/ai-agent')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-luxury-400 hover:text-white hover:bg-luxury-700"
            >
              <Bot className="w-4 h-4" />
              智能代理
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-ambient-blue to-ambient-purple text-white shadow-soft"
            >
              <Clapperboard className="w-4 h-4" />
              趣味玩法
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/pricing" className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-ambient-purple to-ambient-pink text-white text-sm rounded-lg opacity-70 hover:opacity-100 transition-opacity">
              <Crown className="w-4 h-4" />订阅会员
            </Link>
            {isLoggedIn ? (
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-glass-light transition-colors">
                  <img src={user?.avatar || 'https://i.pravatar.cc/100'} alt="avatar" className="w-8 h-8 rounded-lg" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-luxury-800 rounded-xl border border-glass-border shadow-soft overflow-hidden">
                    <button onClick={() => { navigate('/profile'); setShowUserMenu(false) }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-glass-light transition-colors text-left text-sm text-luxury-200">
                      <User className="w-4 h-4" />个人中心
                    </button>
                    <button onClick={() => { logout(); navigate('/', { replace: true }); setShowUserMenu(false) }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-glass-light transition-colors text-left text-sm text-luxury-300">
                      <LogOut className="w-4 h-4" />退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="btn-secondary text-sm">登录</button>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-glass-light rounded-full border border-glass-border mb-4">
              <Clapperboard className="w-3.5 h-3.5 text-ambient-purple" />
              <span className="text-xs text-luxury-300">趣味玩法</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">
              将你的产品植入<span className="gradient-text">任何一部电影</span>
            </h1>
            <p className="text-luxury-400 text-base max-w-xl mx-auto">
              让经典角色为你做广告，打造独特的品牌记忆点
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  step >= s 
                    ? 'bg-gradient-to-r from-ambient-blue to-ambient-purple text-white shadow-soft' 
                    : 'bg-luxury-800/50 text-luxury-400 backdrop-blur-sm border border-glass-border'
                }`}>
                  {step > s ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center text-sm font-medium">{s}</span>
                  )}
                  <span className="hidden sm:inline text-sm font-medium">
                    {stepLabels[s - 1]}
                  </span>
                </div>
                {s < 4 && <span className="text-luxury-500 mx-2">→</span>}
              </div>
            ))}
          </div>

          {step === 1 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="space-y-6"
            >
              <div className="bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-ambient-purple" />
                  产品信息 <span className="text-luxury-500 text-sm">*必填</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-2 block">
                      产品名称
                    </label>
                    <input
                      type="text"
                      value={productInfo.name}
                      onChange={(e) => setProductInfo({ ...productInfo, name: e.target.value })}
                      placeholder="输入产品名称..."
                      className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-2 block">
                      产品Logo <span className="text-luxury-600">(jpg/png, ≤500KB)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-xl bg-luxury-950/50 border-2 border-dashed border-white/10 overflow-hidden relative">
                        {productInfo.logo ? (
                          <>
                            <img src={productInfo.logo} alt="Logo" className="w-full h-full object-cover" />
                            <button
                              onClick={() => setProductInfo({ ...productInfo, logo: '' })}
                              className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
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
                        {productInfo.logo ? '更换' : '上传Logo'}
                        <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleLogoUpload} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-2 block">
                    产品描述 <span className="text-luxury-500">*必填</span>
                  </label>
                  <textarea
                    value={productInfo.description}
                    onChange={(e) => setProductInfo({ ...productInfo, description: e.target.value })}
                    placeholder="输入产品特点、卖点..."
                    className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all resize-none h-24"
                  />
                </div>

                <div className="mt-6">
                  <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-2 block">
                    产品图片 <span className="text-luxury-500">*必填 (jpg/png, ≤2M, 最多3张)</span>
                  </label>
                  <div className="flex gap-3">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="w-24 h-24 rounded-xl bg-luxury-950/50 border-2 border-dashed border-white/10 overflow-hidden relative">
                        {productInfo.images[idx] && productInfo.images[idx] !== '' ? (
                          <>
                            <img src={productInfo.images[idx]} alt={`产品${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeImage(idx)}
                              className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
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
                              onChange={(e) => handleImageUpload(e, idx)}
                            />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center">
                <button 
                  onClick={handleSaveProject}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-3 bg-luxury-700 text-white rounded-xl hover:bg-luxury-600 transition-colors disabled:opacity-50 text-sm mr-4"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  保存
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedFromStep1}
                  className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一步
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="space-y-6"
            >
              <div className="bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Film className="w-5 h-5 text-ambient-purple" />
                  选择电影类型
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {movieTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedMovieType(type.id)}
                      className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                        selectedMovieType === type.id
                          ? 'bg-ambient-purple/20 border-ambient-purple text-white'
                          : 'bg-luxury-950/50 border-white/10 text-luxury-400 hover:border-purple-400/50'
                      }`}
                    >
                      <span className="text-xl">{type.icon}</span>
                      <span className="text-xs">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedMovieType && (
                <div className="bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Clapperboard className="w-5 h-5 text-ambient-purple" />
                    选择具体电影
                  </h3>
                  
                  <div className="mb-4">
                    <p className="text-sm text-luxury-400 mb-3">热门推荐</p>
                    <div className="flex flex-wrap gap-2">
                      {movies.map((movie) => (
                        <button
                          key={movie}
                          onClick={() => { setSpecificMovie(movie); setCustomMovie('') }}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            specificMovie === movie
                              ? 'bg-ambient-purple text-white'
                              : 'bg-luxury-950/50 border border-white/10 text-luxury-300 hover:border-purple-400/50'
                          }`}
                        >
                          {movie}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-luxury-400 mb-3">或自定义电影</p>
                    <input
                      type="text"
                      value={customMovie}
                      onChange={(e) => { setCustomMovie(e.target.value); setSpecificMovie('') }}
                      placeholder="输入你想要植入的电影名称..."
                      className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-ambient-purple" />
                  时长
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {durations.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={`p-4 rounded-xl border transition-all ${
                        duration === d.value
                          ? 'bg-ambient-purple/20 border-ambient-purple text-white'
                          : 'bg-luxury-950/50 border-white/10 text-luxury-300 hover:border-purple-400/50'
                      }`}
                    >
                      <div className="font-medium">{d.label}</div>
                      <div className="text-xs text-luxury-500 mt-1">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-ambient-purple" />
                  画幅比例
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {aspectRatios.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        aspectRatio === ratio.value
                          ? 'bg-ambient-purple/20 border-ambient-purple text-white'
                          : 'bg-luxury-950/50 border-white/10 text-luxury-300 hover:border-purple-400/50'
                      }`}
                    >
                      <ratio.icon className="w-6 h-6" />
                      <div className="font-medium">{ratio.label}</div>
                      <div className="text-xs text-luxury-500">{ratio.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary px-8 py-3"
                >
                  上一步
                </button>
                <button 
                  onClick={handleSaveProject}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-3 bg-luxury-700 text-white rounded-xl hover:bg-luxury-600 transition-colors disabled:opacity-50 text-sm mr-4"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  保存
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedMovieType || (!specificMovie && !customMovie) || isGenerating}
                  className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  {isGenerating ? '生成中...' : '开始生成'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="space-y-6"
            >
              <div className="bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-ambient-purple" />
                  剧本确认 {isGenerating && <span className="text-luxury-400 text-sm">(生成中...)</span>}
                </h3>
                
                {isGenerating && (
                  <div className="mb-6">
                    <div className="relative h-2 bg-luxury-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-ambient-blue to-ambient-purple"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-sm text-luxury-300">{currentStatus}</p>
                    </div>
                  </div>
                )}
                {/* Script display or edit area */}
                <div className="bg-luxury-950/50 border border-white/10 rounded-xl p-4 h-80 overflow-y-auto">
                  {isEditingScript ? (
                    <textarea
                      value={tempScriptContent}
                      onChange={(e) => {
                        setTempScriptContent(e.target.value)
                        setScriptEdited(true)
                      }}
                      className="w-full h-full min-h-[280px] bg-transparent text-luxury-300 text-sm font-mono resize-none focus:outline-none"
                      placeholder="请编辑剧本内容..."
                    />
                  ) : (
                    <pre className="text-luxury-300 text-sm whitespace-pre-wrap font-mono">
                      {isGenerating ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-8 h-8 text-ambient-purple animate-spin mr-3" />
                          <span className="text-luxury-400">AI正在创作剧本，请稍候...</span>
                        </div>
                      ) : scriptContent || '暂无剧本内容'}
                    </pre>
                  )}
                </div>

                {scriptEdited && !isEditingScript && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-amber-400 text-sm">
                    ⚠️ 剧本已修改，请点击"确认修改"后生成视频
                  </div>
                )}

                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => setStep(2)}
                    disabled={isGenerating || isEditingScript}
                    className="btn-secondary px-8 py-3 flex items-center gap-2 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    上一步
                  </button>
                  <button 
                    onClick={handleSaveProject}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-3 bg-luxury-700 text-white rounded-xl hover:bg-luxury-600 transition-colors disabled:opacity-50 text-sm mx-4"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    保存
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (isEditingScript) {
                          // Confirm edit
                          setScriptContent(tempScriptContent)
                          setScriptEdited(false)
                          setIsEditingScript(false)
                        } else {
                          // Start editing
                          setTempScriptContent(scriptContent)
                          setIsEditingScript(true)
                        }
                      }}
                      disabled={isGenerating}
                      className="btn-secondary px-8 py-3 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Pencil className="w-4 h-4" />
                      {isEditingScript ? '确认修改' : '修改剧本'}
                    </button>
                    <button
                      onClick={handleStartVideoGeneration}
                      disabled={isGenerating || !scriptContent || isGeneratingVideos || scriptEdited}
                      className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4" />
                      {isGeneratingVideos ? '生成中...' : '开始生成视频'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="space-y-6"
            >
              <div className="bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-ambient-purple" />
                  视频预览 {parsedScript && <span className="text-luxury-400 text-sm font-normal">(共{videoClips.length}个片段)</span>}
                </h3>
                
                {isGeneratingVideos && (
                  <div className="mb-6">
                    <div className="relative h-2 bg-luxury-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-ambient-blue to-ambient-purple"
                        initial={{ width: 0 }}
                        animate={{ width: `${videoGenerationProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-sm text-luxury-300">{currentStatus || '正在生成视频...'}</p>
                      <p className="text-xs text-luxury-500 mt-1">{videoGenerationProgress}%</p>
                    </div>
                  </div>
                )}
                
                {currentTask && currentTask.clips.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentTask.clips.map((clip, index) => (
                        <div key={clip.id || index} className="bg-luxury-900/50 rounded-xl overflow-hidden border border-white/10">
                          <div className="relative aspect-video bg-black">
                            {clip.status === 'completed' && clip.videoUrl ? (
                              <video 
                                src={clip.videoUrl} 
                                controls 
                                className="w-full h-full object-contain"
                                poster={clip.thumbnailUrl}
                              />
                            ) : clip.status === 'processing' ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-luxury-600 animate-spin" />
                              </div>
                            ) : clip.status === 'failed' ? (
                              <div className="w-full h-full flex items-center justify-center flex-col">
                                <Video className="w-8 h-8 text-luxury-600 mb-2" />
                                <p className="text-xs text-red-400">{clip.error || '生成失败'}</p>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-luxury-600 animate-spin" />
                              </div>
                            )}
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                              {videoClips[index] ? `${videoClips[index].startTime}-${videoClips[index].endTime}秒` : ''}
                            </div>
                            <div className="absolute top-2 right-2">
                              {clip.status === 'pending' && (
                                <div className="px-2 py-1 bg-yellow-600 rounded-full text-xs text-white flex items-center gap-1">
                                  等待中
                                </div>
                              )}
                              {clip.status === 'processing' && (
                                <div className="px-2 py-1 bg-blue-600 rounded-full text-xs text-white flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" /> 生成中
                                </div>
                              )}
                              {clip.status === 'completed' && (
                                <div className="px-2 py-1 bg-green-600 rounded-full text-xs text-white flex items-center gap-1">
                                  <Check className="w-3 h-3" /> 完成
                                </div>
                              )}
                              {clip.status === 'failed' && (
                                <div className="px-2 py-1 bg-red-600 rounded-full text-xs text-white">
                                  失败
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-sm text-luxury-300">
                              片段 {index + 1}: {videoClips[index]?.sceneId || `clip_${index}`}
                            </p>
                            <p className="text-xs text-luxury-500 mt-1 truncate">
                              {videoClips[index]?.prompt?.substring(0, 60)}...
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {Object.keys(characterDescriptions).length > 0 && (
                      <div className="bg-luxury-800/30 rounded-lg p-4 border border-white/5">
                        <p className="text-sm text-luxury-400 mb-2">
                          <span className="text-ambient-purple">🎭 人物一致性保持:</span>
                        </p>
                        {Object.entries(characterDescriptions).map(([char, desc]) => (
                          <p key={char} className="text-xs text-luxury-500">
                            • {char}: {desc.substring(0, 80)}...
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-luxury-950/50 border border-white/10 rounded-xl h-96 flex items-center justify-center">
                    <div className="text-center">
                      {isGeneratingVideos ? (
                        <>
                          <Loader2 className="w-16 h-16 text-ambient-purple mx-auto mb-4 animate-spin" />
                          <p className="text-luxury-400">视频生成中...</p>
                          <p className="text-luxury-500 text-sm mt-2">AI正在生成您的广告视频</p>
                        </>
                      ) : (
                        <>
                          <Video className="w-16 h-16 text-luxury-600 mx-auto mb-4" />
                          <p className="text-luxury-400">点击"开始生成视频"创建广告视频</p>
                          <p className="text-luxury-500 text-sm mt-2">每个片段最长15秒</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => setStep(3)}
                    className="btn-secondary px-8 py-3 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    上一步
                  </button>
                  <button 
                    onClick={handleSaveProject}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-3 bg-luxury-700 text-white rounded-xl hover:bg-luxury-600 transition-colors disabled:opacity-50 text-sm mx-4"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    保存
                  </button>
                  <button
                    className="btn-primary px-8 py-3 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    下载视频
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
