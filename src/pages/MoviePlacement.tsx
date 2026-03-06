import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Sparkles, Upload, Package, X, ArrowLeft, 
  Clock, Monitor, Smartphone, Wand2, Crown, User, LogOut,
  Clapperboard, Film, Video, Loader2, Bot, Pencil, Play, Layers, Download, Check, Save,
  ChevronLeft, ChevronRight, FileText, RefreshCw
} from 'lucide-react'
import { useStore } from '../store'
import { generateScript } from '../services/scriptGenerator'
import type { MovieInfo } from '../services/movieService'
import { parseScript, extractCharacterDescriptions, type VideoClip } from '../services/sceneSegmentation'
import { createVideoTask, getVideoTask, mergeVideoClips, getMergedVideoInfo, type VideoTask } from '../services/videoTaskService'
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

const stepLabels = ['产品信息', '电影设定', '剧本确认', '视频预览', '最终作品']

export default function MoviePlacement() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user, isLoggedIn, logout, setShowLoginModal, movieProjects, addMovieProject, updateMovieProject } = useStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // Get return path from location state, default to profile
  const returnPath = (location.state as { returnPath?: string })?.returnPath || '/profile'
  
  // Get ad type from URL for displaying the correct title
  const adType = searchParams.get('type')
  const pageTitle = adType === 'product' ? '创作产品植入广告' : adType === 'brand' ? '创作品牌植入广告' : adType === 'promotion' ? '创作促销植入广告' : ''
  
  // Current project ID (for editing existing project)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null)
  
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
  // Get step from URL params, default to 1
  const stepParam = searchParams.get('step')
  const initialStep = stepParam ? parseInt(stepParam) : 1
  const [step, setStep] = useState(initialStep)
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
  
  // Support both projectId and taskId from URL
  const projectIdParam = searchParams.get('projectId')
  const taskIdParam = searchParams.get('taskId')
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(taskIdParam)
  const [currentTask, setCurrentTask] = useState<VideoTask | null>(null)
  const [videoGenerationProgress, setVideoGenerationProgress] = useState(0)
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false)
  const [characterDescriptions, setCharacterDescriptions] = useState<Record<string, string>>({})
  const [parsedScript, setParsedScript] = useState<ReturnType<typeof parseScript> | null>(null)
  
  // New states for enhanced workflow control
  const [isVideoCompleted, setIsVideoCompleted] = useState(false)  // 视频是否已生成完成
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)    // 离开弹窗
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)  // 待跳转路径
  const [visitedSteps, setVisitedSteps] = useState<number[]>([1])  // 已访问过的步骤
  
  // Derived state - completed video clips
  const completedClips = currentTask?.clips.filter(c => c.status === 'completed') || []
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  
  // Merged video state
  const [mergedVideoUrl, setMergedVideoUrl] = useState<string | null>(null)
  const [isMergingVideos, setIsMergingVideos] = useState(false)
  const [mergeError, setMergeError] = useState<string | null>(null)
  
  // Prompt dialog state
  const [promptDialog, setPromptDialog] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState('')
  
  // Regenerate dialog state
  const [regenerateDialog, setRegenerateDialog] = useState(false)
  const [regenerateClip, setRegenerateClip] = useState<any>(null)
  const [regeneratePrompt, setRegeneratePrompt] = useState('')
  
  // Handle open regenerate dialog
  const handleOpenRegenerate = (clip: any) => {
    setRegenerateClip(clip)
    setRegeneratePrompt(clip.prompt || '')
    setRegenerateDialog(true)
  }
  
  // 检查视频是否已完成
  useEffect(() => {
    if (currentTask && currentTask.status === 'completed') {
      setIsVideoCompleted(true)
    }
  }, [currentTask])

  // 检查合并视频状态
  useEffect(() => {
    if (!currentTaskId || step !== 5) return
    
    const checkMergedVideo = async () => {
      try {
        const info = await getMergedVideoInfo(currentTaskId)
        if (info.isMerged && info.mergedVideoUrl) {
          setMergedVideoUrl(info.mergedVideoUrl)
        }
      } catch (error) {
        console.error('Error checking merged video:', error)
      }
    }
    
    checkMergedVideo()
  }, [currentTaskId, step])

  // 处理视频合并
  const handleMergeVideos = async () => {
    if (!currentTaskId || isMergingVideos) return
    
    setMergeError(null)
    setIsMergingVideos(true)
    try {
      const result = await mergeVideoClips(currentTaskId)
      setMergedVideoUrl(result.mergedVideoUrl)
    } catch (error: any) {
      console.error('Error merging videos:', error)
      setMergeError(error?.message || '视频合成失败，请稍后重试')
    } finally {
      setIsMergingVideos(false)
    }
  }

  // 加载项目时获取视频任务数据
  useEffect(() => {
    if (!currentTaskId) return
    
    const loadTask = async () => {
      try {
        const task = await getVideoTask(currentTaskId)
        setCurrentTask(task)
        
        // 如果视频已完成，设置相关状态
        if (task.status === 'completed') {
          setIsVideoCompleted(true)
          // 解析剧本获取视频片段信息
          if (task.script) {
            const parsed = parseScript(task.script, task.aspectRatio || '16:9')
            setParsedScript(parsed)
            setVideoClips(parsed.clips)
          }
        }
        
        // 如果视频正在生成，启动轮询
        if (task.status === 'processing') {
          setIsGeneratingVideos(true)
        }
      } catch (error) {
        console.error('Failed to load video task:', error)
      }
    }
    
    loadTask()
  }, [currentTaskId])

  // 继续轮询当切换步骤时（只要有任务ID就继续）
  useEffect(() => {
    if (!currentTaskId) return
    
    const pollInterval = setInterval(async () => {
      try {
        const task = await getVideoTask(currentTaskId)
        setCurrentTask(task)
        
        // 计算进度
        const completed = task.clips.filter(c => c.status === 'completed').length
        const total = task.clips.length
        setVideoGenerationProgress(Math.round((completed / total) * 100))
        
        // 更新状态
        const processing = task.clips.find(c => c.status === 'processing')
        const failed = task.clips.find(c => c.status === 'failed')
        
        if (task.status === 'completed') {
          setIsGeneratingVideos(false)
          setIsVideoCompleted(true)
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
    }, 10000)  // 每10秒轮询
    
    return () => clearInterval(pollInterval)
  }, [currentTaskId])

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
  
  // 处理离开页面的导航
  const handleNavigate = (path: string) => {
    // 如果有未保存的内容，弹出确认对话框
    const hasContent = productInfo.name || productInfo.description || scriptContent || currentTaskId
    const isProcessing = isGenerating || isGeneratingVideos
    
    if (hasContent && (isProcessing || !currentProjectId)) {
      // 有内容且正在处理或新建项目，弹出保存询问
      setPendingNavigation(path)
      setShowLeaveDialog(true)
    } else {
      navigate(path)
    }
  }
  
  // 确认离开并保存
  const handleConfirmLeave = async () => {
    await handleSaveProject()
    setShowLeaveDialog(false)
    if (pendingNavigation) {
      navigate(pendingNavigation)
    }
  }
  
  // 不保存直接离开
  const handleDiscardLeave = () => {
    setShowLeaveDialog(false)
    if (pendingNavigation) {
      navigate(pendingNavigation)
    }
  }
  
  // 取消离开
  const handleCancelLeave = () => {
    setShowLeaveDialog(false)
    setPendingNavigation(null)
  }
  
  // 处理步骤切换
  const handleStepChange = (newStep: number) => {
    // 记录已访问的步骤
    if (!visitedSteps.includes(newStep)) {
      setVisitedSteps(prev => [...prev, newStep])
    }
    
    // 如果视频已完成，可以自由切换步骤1-5
    if (isVideoCompleted || newStep === 5) {
      setStep(newStep)
      return
    }
    
    // 未完成时的规则：
    // - 可以前进到下一步
    // - 可以返回上一步
    // - 可以返回已访问过的任意步骤
    const currentStepNum = step
    
    if (newStep > currentStepNum) {
      // 前进：只能到下一步或已访问过的步骤
      if (newStep === currentStepNum + 1 || visitedSteps.includes(newStep)) {
        setStep(newStep)
      }
    } else {
      // 后退：可以返回上一步或已访问过的任意步骤
      setStep(newStep)
    }
  }
  
  // 记录初始步骤访问
  useEffect(() => {
    if (!visitedSteps.includes(step)) {
      setVisitedSteps(prev => [...prev, step])
    }
  }, [step])

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

  // 处理粘贴的图片URL
  const handleImageUrlPaste = (url: string) => {
    if (!url) return
    
    // 验证是否为有效的 HTTPS URL
    if (!url.startsWith('https://')) {
      alert('请输入有效的 HTTPS 图片地址')
      return
    }
    
    // 检查是否为有效的图片URL（以常见图片扩展名结尾）
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']
    const isValidImage = validExtensions.some(ext => url.toLowerCase().includes(ext)) || 
                         url.includes('image') ||
                         url.includes('img')
    
    if (!isValidImage && !url.match(/\.(jpg|jpeg|png|webp|gif|bmp)(\?.*)?$/i)) {
      // 尝试更严格的验证
      const hasValidExtension = url.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|bmp)(\?.*)?$/)
      if (!hasValidExtension) {
        alert('请输入有效的图片地址（如 https://example.com/image.jpg）')
        return
      }
    }
    
    // 找到第一个空位
    const emptyIdx = productInfo.images.findIndex(img => !img || img === '')
    if (emptyIdx === -1) {
      alert('图片已满，请先删除一张')
      return
    }
    
    const newImages = [...productInfo.images]
    newImages[emptyIdx] = url
    setProductInfo({ ...productInfo, images: newImages })
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
    // 如果已有任务，直接跳转到视频预览页面
    if (currentTask && currentTask.clips.length > 0) {
      setStep(4)
      return
    }
    
    if (!scriptContent) {
      alert('请先生成剧本')
      return
    }
    
    console.log('[DEBUG] scriptContent:', scriptContent.substring(0, 500))
    console.log('[DEBUG] scriptContent full:', scriptContent)
    
    const parsed = parseScript(scriptContent, aspectRatio)
    console.log('[DEBUG] Parsed script:', JSON.stringify(parsed, null, 2))
    console.log('[DEBUG] Clips:', parsed.clips)
    console.log('[DEBUG] Scenes:', parsed.scenes)
    
    if (!parsed.clips || parsed.clips.length === 0) {
      alert('剧本解析失败，请重新生成剧本')
      return
    }
    
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
    // 产品图片不再是必填项（使用文生视频模式）
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
  // 产品图片不再是必填项
  const canProceedFromStep1 = productInfo.name && productInfo.description
  const progressPercent = (currentStep / 6) * 100

  return (
    <div className="min-h-screen bg-luxury-950">
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          {/* Left: Back Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigate(returnPath)}
              className="flex items-center gap-2 px-3 py-2 text-luxury-400 hover:text-white hover:bg-luxury-700 rounded-lg transition-colors"
              title="返回"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {pageTitle && (
              <span className="text-lg font-medium text-white">{pageTitle}</span>
            )}
          </div>

          {/* Center: Empty - no mode switching buttons */}

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

      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-8">

          <div className="flex items-center justify-center gap-2 mt-20 mb-8">
            {[1, 2, 3, 4, 5].map((s) => (
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
                {s < 5 && <span className="text-luxury-500 mx-2">→</span>}
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
                    产品图片 <span className="text-luxury-500">(可选, jpg/png, ≤2M, 最多3张)</span>
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
                  
                  {/* 图片URL输入框 */}
                  <div className="mt-3">
                    <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-2 block">
                      或粘贴图片地址（直接图片链接，如 https://xxx.jpg 或 https://xxx.png）
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="imageUrlInput"
                        placeholder="https://example.com/product.jpg"
                        className="flex-1 bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement
                            handleImageUrlPaste(input.value)
                            input.value = ''
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('imageUrlInput') as HTMLInputElement
                          handleImageUrlPaste(input.value)
                          input.value = ''
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-colors text-sm"
                      >
                        添加
                      </button>
                    </div>
                    <p className="text-xs text-luxury-500 mt-1">
                      支持 .jpg .jpeg .png .webp .gif 格式，请确保是直接的图片链接
                    </p>
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
                  onClick={() => {
                    // 如果步骤2已访问过，直接跳转；否则进入步骤2
                    if (visitedSteps.includes(2)) {
                      setStep(2)
                    } else {
                      handleStepChange(2)
                    }
                  }}
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
                  onClick={() => handleStepChange(1)}
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
                    onClick={() => handleStepChange(2)}
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
                      onClick={() => {
                        if (currentTask && currentTask.clips.length > 0) {
                          // 如果步骤4已访问过，直接跳转；否则进入步骤4
                          if (visitedSteps.includes(4)) {
                            setStep(4)
                          } else {
                            setStep(4)
                          }
                        } else {
                          handleStartVideoGeneration()
                        }
                      }}
                      disabled={isGenerating || !scriptContent || isGeneratingVideos || scriptEdited}
                      className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4" />
                      {currentTask && currentTask.clips.length > 0 ? '下一步' : '开始生成视频'}
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
                    {/* 主播放器 */}
                    {completedClips.length > 0 && (
                      <div className="card overflow-hidden">
                        <div className="relative aspect-video bg-black">
                          <video
                            key={currentVideoIndex}
                            src={completedClips[currentVideoIndex]?.videoUrl}
                            controls
                            className="w-full h-full object-contain"
                            autoPlay
                          />
                          {/* 视频导航 */}
                          {completedClips.length > 1 && (
                            <>
                              <button 
                                onClick={() => setCurrentVideoIndex(i => Math.max(0, i - 1))}
                                disabled={currentVideoIndex === 0}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft className="w-6 h-6" />
                              </button>
                              <button 
                                onClick={() => setCurrentVideoIndex(i => Math.min(completedClips.length - 1, i + 1))}
                                disabled={currentVideoIndex === completedClips.length - 1}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronRight className="w-6 h-6" />
                              </button>
                            </>
                          )}
                          {/* 片段指示器 */}
                          {completedClips.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                              {completedClips.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentVideoIndex(idx)}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    idx === currentVideoIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/70'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="p-4 border-t border-glass-border">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-base font-semibold text-white">{currentTask.name}</h4>
                              <p className="text-sm text-luxury-400 mt-1">
                                片段 {currentVideoIndex + 1}: {completedClips[currentVideoIndex]?.prompt?.substring(0, 50)}...
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm text-white ${
                              currentTask.status === 'completed' ? 'bg-green-600' :
                              currentTask.status === 'processing' ? 'bg-blue-600' :
                              currentTask.status === 'pending' ? 'bg-yellow-600' :
                              currentTask.status === 'failed' ? 'bg-red-600' : 'bg-gray-600'
                            }`}>
                              {currentTask.status === 'completed' ? '已完成' :
                               currentTask.status === 'processing' ? '生成中' :
                               currentTask.status === 'pending' ? '等待中' :
                               currentTask.status === 'failed' ? '失败' : currentTask.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 视频片段列表 - 增加了按钮 */}
                    <div className="card p-4">
                      <h4 className="text-base font-medium text-white mb-4">视频片段 ({currentTask.clips.length}个)</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {currentTask.clips.map((clip, idx) => (
                          <div key={clip.id || idx} className="space-y-2">
                            {/* 视频预览区域 - 点击在主播放器中播放 */}
                            <button
                              onClick={() => {
                                if (clip.status === 'completed' && clip.videoUrl) {
                                  const completedIdx = completedClips.findIndex(c => c.id === clip.id)
                                  if (completedIdx !== -1) {
                                    setCurrentVideoIndex(completedIdx)
                                  }
                                }
                              }}
                              disabled={clip.status !== 'completed'}
                              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all w-full ${
                                clip.status === 'completed' 
                                  ? 'border-transparent hover:border-primary cursor-pointer' 
                                  : 'border-luxury-700 cursor-not-allowed opacity-60'
                              }`}
                            >
                              {clip.status === 'completed' && clip.videoUrl ? (
                                <>
                                  <div className="absolute inset-0 bg-black">
                                    <video
                                      src={clip.videoUrl}
                                      className="w-full h-full object-cover"
                                      muted
                                      ref={el => {
                                        if (el) {
                                          el.currentTime = 0
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                      <Play className="w-8 h-8 text-white ml-1" />
                                    </div>
                                  </div>
                                </>
                              ) : clip.status === 'processing' ? (
                                <div className="w-full h-full flex items-center justify-center bg-luxury-800">
                                  <Loader2 className="w-8 h-8 text-luxury-500 animate-spin" />
                                </div>
                              ) : clip.status === 'failed' ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-luxury-800">
                                  <X className="w-8 h-8 text-red-500" />
                                  <span className="text-xs text-red-400 mt-1">失败</span>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-luxury-800">
                                  <Clock className="w-8 h-8 text-luxury-500" />
                                </div>
                              )}
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">
                                {clip.startTime}-{clip.endTime}秒
                              </div>
                            </button>
                            
                            {/* 片段操作按钮 */}
                            <div className="flex gap-1">
                              {clip.status === 'completed' && clip.videoUrl && (
                                <button
                                  onClick={() => {
                                    const a = document.createElement('a')
                                    a.href = clip.videoUrl!
                                    a.download = `片段${idx + 1}.mp4`
                                    a.click()
                                  }}
                                  className="flex-1 flex items-center justify-center px-2 py-1.5 bg-luxury-800 hover:bg-luxury-700 rounded text-xs text-luxury-300 transition-colors"
                                  title="下载"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedPrompt(clip.prompt || '')
                                  setPromptDialog(true)
                                }}
                                className="flex-1 flex items-center justify-center px-2 py-1.5 bg-luxury-800 hover:bg-luxury-700 rounded text-xs text-luxury-300 transition-colors"
                                title="查看提示词"
                              >
                                <FileText className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleOpenRegenerate(clip)}
                                className="flex-1 flex items-center justify-center px-2 py-1.5 bg-luxury-800 hover:bg-luxury-700 rounded text-xs text-luxury-300 transition-colors"
                                title="修改视频"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
                    onClick={() => handleStepChange(3)}
                    className="btn-secondary px-8 py-3 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    上一步
                  </button>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleSaveProject}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-3 bg-luxury-700 text-white rounded-xl hover:bg-luxury-600 transition-colors disabled:opacity-50 text-sm mx-2"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      保存
                    </button>
                    <button
                      onClick={async () => {
                        // 跳转到步骤5并开始合成视频
                        if (currentTaskId && completedClips.length > 0) {
                          setStep(5)
                          // 开始合成视频
                          setMergeError(null)
                          setIsMergingVideos(true)
                          try {
                            const result = await mergeVideoClips(currentTaskId)
                            setMergedVideoUrl(result.mergedVideoUrl)
                          } catch (error: any) {
                            console.error('Error merging videos:', error)
                            setMergeError(error?.message || '视频合成失败，请稍后重试')
                          } finally {
                            setIsMergingVideos(false)
                          }
                        }
                      }}
                      disabled={!currentTaskId || completedClips.length === 0}
                      className="px-6 py-3 bg-gradient-to-r from-ambient-purple to-ambient-pink text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Film className="w-4 h-4" />
                      合成视频
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && currentTaskId && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="space-y-6"
            >
              <div className="bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Film className="w-5 h-5 text-ambient-purple" />
                  最终作品
                </h3>
                
                {/* 最终作品内容 - 只显示一个合并后的视频 */}
                {completedClips.length > 0 ? (
                  <>
                    {/* 任务信息 */}
                    <div className="bg-luxury-900/50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{currentTask?.name || '视频作品'}</h4>
                          <p className="text-sm text-luxury-400 mt-1">
                            共 {completedClips.length} 个视频片段 | 总时长 {currentTask?.duration || '15'}秒
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {mergedVideoUrl ? (
                            <span className="flex items-center gap-2 text-green-400">
                              <Check className="w-5 h-5" />
                              已合成
                            </span>
                          ) : isMergingVideos ? (
                            <span className="flex items-center gap-2 text-yellow-400">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              合成中...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-yellow-400">
                              <Video className="w-5 h-5" />
                              未合成
                            </span>
                          )}
                        </div>
                      </div>
                      {/* 查看剧本按钮 */}
                      {currentTask?.script && (
                        <button
                          onClick={() => {
                            setSelectedPrompt(currentTask.script)
                            setPromptDialog(true)
                          }}
                          className="mt-3 flex items-center gap-2 px-4 py-2 bg-luxury-800 text-luxury-300 rounded-lg hover:bg-luxury-700 transition-colors text-sm"
                        >
                          <FileText className="w-4 h-4" />
                          查看剧本
                        </button>
                      )}
                    </div>

                    {/* 最终视频播放器 - 显示合并后的视频 */}
                    <div className="card overflow-hidden">
                      <div className="relative aspect-video bg-black">
                        {mergeError ? (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <X className="w-16 h-16 text-red-500 mb-4" />
                            <p className="text-red-400 text-lg">视频合成失败</p>
                            <p className="text-luxury-500 text-sm mt-2">{mergeError}</p>
                          </div>
                        ) : mergedVideoUrl ? (
                          <video
                            src={mergedVideoUrl}
                            controls
                            className="w-full h-full object-contain"
                            autoPlay
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <Video className="w-16 h-16 text-luxury-600 mb-4" />
                            <p className="text-luxury-400">视频未合成</p>
                          </div>
                        )}
                      </div>
                      <div className="p-4 border-t border-glass-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white">
                              {mergedVideoUrl ? '合并后的视频' : mergeError ? '合成失败' : ''}
                            </p>
                            <p className="text-xs text-luxury-500 mt-1">
                              共 {completedClips.length} 个片段，总时长 {currentTask?.duration || '15'}秒
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* 再次合成按钮 */}
                            {(mergeError || !mergedVideoUrl) && (
                              <button
                                onClick={async () => {
                                  if (!currentTaskId) return
                                  setMergeError(null)
                                  setIsMergingVideos(true)
                                  try {
                                    const result = await mergeVideoClips(currentTaskId)
                                    setMergedVideoUrl(result.mergedVideoUrl)
                                  } catch (error: any) {
                                    console.error('Error merging videos:', error)
                                    setMergeError(error?.message || '视频合成失败')
                                  } finally {
                                    setIsMergingVideos(false)
                                  }
                                }}
                                disabled={isMergingVideos}
                                className="flex items-center gap-2 px-4 py-2 bg-luxury-800 text-luxury-300 rounded-lg hover:bg-luxury-700 transition-colors text-sm disabled:opacity-50"
                              >
                                {isMergingVideos ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Film className="w-4 h-4" />
                                )}
                                {isMergingVideos ? '合成中...' : '再次合成'}
                              </button>
                            )}
                            {/* 下载按钮 */}
                            <button
                              onClick={() => {
                                if (!mergedVideoUrl || mergeError) {
                                  alert('请先合成视频')
                                  return
                                }
                                const url = mergedVideoUrl
                                if (url) {
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = `最终作品.mp4`
                                  a.click()
                                }
                              }}
                              disabled={!mergedVideoUrl || !!mergeError || isMergingVideos}
                              className="flex items-center gap-2 px-4 py-2 bg-luxury-800 text-luxury-300 rounded-lg hover:bg-luxury-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Download className="w-4 h-4" />
                              下载
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Film className="w-16 h-16 text-luxury-600 mx-auto mb-4" />
                    <p className="text-luxury-400">暂无生成完成的视频</p>
                    <p className="text-sm text-luxury-500 mt-2">请先在视频预览步骤生成视频</p>
                  </div>
                )}
              </div>

              {/* 底部操作栏 */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleStepChange(4)}
                  className="btn-secondary px-8 py-3 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  上一步
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleSaveProject}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-3 bg-luxury-700 text-white rounded-xl hover:bg-luxury-600 transition-colors disabled:opacity-50 text-sm mx-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    保存
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Video Modal */}
      {videoModalOpen && selectedVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button 
            onClick={() => setVideoModalOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-luxury-800 rounded-lg"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <video
            src={selectedVideoUrl}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}

      {/* Prompt Dialog */}
      {promptDialog && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-luxury-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">视频提示词</h3>
              <button onClick={() => setPromptDialog(false)} className="p-1 hover:bg-luxury-800 rounded-lg">
                <X className="w-5 h-5 text-luxury-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <pre className="text-sm text-luxury-300 whitespace-pre-wrap">{selectedPrompt}</pre>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setPromptDialog(false)} className="btn-primary">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Dialog */}
      {regenerateDialog && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-luxury-900 rounded-2xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">修改视频提示词</h3>
              <button onClick={() => setRegenerateDialog(false)} className="p-1 hover:bg-luxury-800 rounded-lg">
                <X className="w-5 h-5 text-luxury-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-luxury-400 mb-2 block">提示词内容</label>
                <textarea
                  value={regeneratePrompt}
                  onChange={(e) => setRegeneratePrompt(e.target.value)}
                  className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all h-48 resize-none"
                  placeholder="输入视频提示词..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRegenerateDialog(false)}
                  className="px-4 py-2 bg-luxury-800 text-luxury-300 rounded-lg hover:bg-luxury-700"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    // 这里可以添加重新生成逻辑
                    setRegenerateDialog(false)
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-ambient-purple to-ambient-pink text-white rounded-lg hover:opacity-90"
                >
                  重新生成
                </button>
              </div>
              </div>
            </div>
          </div>
        )}

      {/* Merge Error Dialog */}
      {mergeError && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-luxury-900 rounded-2xl p-6 max-w-md w-full border border-red-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">视频合成失败</h3>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMergeError(null)}
                className="px-4 py-2 bg-luxury-800 text-luxury-300 rounded-lg hover:bg-luxury-700"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirmation Dialog */}
      {showLeaveDialog && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-luxury-900 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">离开确认</h3>
            <p className="text-luxury-300 mb-6">
              {isGenerating || isGeneratingVideos 
                ? '项目正在处理中，是否保存当前进度？'
                : '项目有未保存的内容，是否保存？'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDiscardLeave}
                className="px-4 py-2 bg-luxury-800 text-luxury-300 rounded-lg hover:bg-luxury-700"
              >
                不保存
              </button>
              <button
                onClick={handleConfirmLeave}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '保存并离开'}
              </button>
              <button
                onClick={handleCancelLeave}
                className="px-4 py-2 bg-luxury-700 text-white rounded-lg hover:bg-luxury-600"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Playback Modal */}
      {videoModalOpen && selectedVideoUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setVideoModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-4xl bg-luxury-900 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <video 
              src={selectedVideoUrl} 
              controls 
              autoPlay
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}
