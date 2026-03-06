import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Play, Pause, Download, Trash2, 
  Clock, Loader2, Check, X, ChevronLeft, ChevronRight,
  Sparkles, Clapperboard, FileText, RefreshCw, Film, CheckCircle, AlertCircle
} from 'lucide-react'
import { getVideoTask, deleteVideoTask, retryVideoTask, createVideoTask, type VideoTask, type VideoClip } from '../services/videoTaskService'
import ConfirmDialog from '../components/ConfirmDialog'

export default function VideoDetail() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<VideoTask | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  
  // Prompt dialog state
  const [promptDialog, setPromptDialog] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState('')
  
  // Regenerate dialog state
  const [regenerateDialog, setRegenerateDialog] = useState(false)
  const [regenerateVideoClip, setRegenerateVideoClip] = useState<VideoClip | null>(null)
  const [regeneratePrompt, setRegeneratePrompt] = useState('')
  const [regenerateStatus, setRegenerateStatus] = useState<'idle' | 'submitting' | 'modifying' | 'completed'>('idle')
  const [regenerateVideoUrl, setRegenerateVideoUrl] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (taskId) {
      loadTask()
    }
  }, [taskId])

  // Poll for task updates when regenerating
  useEffect(() => {
    if (regenerateStatus === 'modifying') {
      const interval = setInterval(() => {
        loadTask()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [regenerateStatus])

  const loadTask = async () => {
    try {
      const data = await getVideoTask(taskId!)
      setTask(data)
      
      // Check if regeneration completed
      if (regenerateStatus === 'modifying' && regenerateVideoClip) {
        const updatedVideoClip = data.clips.find(c => c.prompt === regeneratePrompt && c.status === 'completed')
        if (updatedVideoClip && updatedVideoClip.videoUrl) {
          setRegenerateStatus('completed')
          setRegenerateVideoUrl(updatedVideoClip.videoUrl)
        }
      }
    } catch (error) {
      console.error('Failed to load task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteConfirm(true)
  }
  
  const handleConfirmDelete = async () => {
    try {
      await deleteVideoTask(taskId!)
      navigate('/profile')
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
    setDeleteConfirm(false)
  }

  const handleRetry = async () => {
    try {
      await retryVideoTask(taskId!)
      loadTask()
    } catch (error) {
      console.error('Failed to retry task:', error)
    }
  }
  
  // Show prompt dialog
  const handleShowPrompt = (clip: VideoClip) => {
    setSelectedPrompt(clip.prompt || '')
    setPromptDialog(true)
  }
  
  // Open regenerate dialog
  const handleOpenRegenerate = (clip: VideoClip) => {
    setRegenerateVideoClip(clip)
    setRegeneratePrompt(clip.prompt || '')
    setRegenerateStatus('idle')
    setRegenerateVideoUrl(clip.videoUrl || '')
    setRegenerateDialog(true)
  }
  
  // Submit regenerate task
  const handleSubmitRegenerate = async () => {
    if (!regenerateVideoClip || !regeneratePrompt.trim()) return
    
    setRegenerateStatus('modifying')
    
    try {
      // Create a new task with modified prompt
      await createVideoTask({
        name: task!.name + '_修改',
        productName: task!.productName,
        productDescription: task!.productDescription,
        productImages: task!.productImages || [],
        productLogo: task!.productLogo || '',
        movieName: task!.movieName,
        movieType: task!.movieType,
        duration: task!.duration,
        aspectRatio: task!.aspectRatio,
        script: task!.script,
        clips: [{
          index: 0,
          prompt: regeneratePrompt,
          startTime: regenerateVideoClip.startTime,
          endTime: regenerateVideoClip.endTime
        }]
      })
      
      // Reload task to get updated status
      await loadTask()
    } catch (error) {
      console.error('Failed to submit regenerate task:', error)
      setRegenerateStatus('idle')
    }
  }
  
  // Download single video
  const handleDownload = async (videoUrl: string, filename: string) => {
    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }
  
  // Navigate to final work page
  const handleMergeVideos = () => {
    navigate(`/final-work/${taskId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600'
      case 'processing': return 'bg-blue-600'
      case 'pending': return 'bg-yellow-600'
      case 'failed': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成'
      case 'processing': return '生成中'
      case 'pending': return '等待中'
      case 'failed': return '失败'
      default: return status
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-ambient-purple animate-spin" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-luxury-950 flex flex-col items-center justify-center">
        <p className="text-luxury-400 mb-4">视频任务不存在</p>
        <button onClick={() => navigate('/profile')} className="btn-primary">
          返回个人中心
        </button>
      </div>
    )
  }

  const completedVideoClips = task.clips.filter(c => c.status === 'completed')
  const failedVideoClips = task.clips.filter(c => c.status === 'failed')

  return (
    <div className="min-h-screen bg-luxury-950">
      {/* Header */}
      <header className="glass">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile')} className="p-1.5 hover:bg-glass-light rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4 text-luxury-300" />
            </button>
            <h1 className="text-lg font-semibold text-white">视频详情</h1>
          </div>
          <div className="flex items-center gap-2">
            {completedVideoClips.length > 0 && (
              <button 
                onClick={() => navigate(`/final-work/${taskId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ambient-purple to-ambient-pink text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                <Film className="w-4 h-4" />
                最终作品
              </button>
            )}
            <button 
              onClick={handleRetry}
              disabled={task.status === 'processing' || (failedVideoClips.length === 0 && completedVideoClips.length > 0)}
              className="flex items-center gap-2 px-4 py-2 bg-luxury-800 text-luxury-300 rounded-lg hover:bg-luxury-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Sparkles className="w-4 h-4" />
              重试失败
            </button>
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 视频播放区域 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 主播放器 */}
            <div className="card overflow-hidden">
              <div className="relative aspect-video bg-black">
                {completedVideoClips.length > 0 ? (
                  <>
                    <video
                      key={currentVideoIndex}
                      src={completedVideoClips[currentVideoIndex]?.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                      autoPlay
                    />
                    {/* 视频导航 */}
                    {completedVideoClips.length > 1 && (
                      <>
                        <button 
                          onClick={() => setCurrentVideoIndex(i => Math.max(0, i - 1))}
                          disabled={currentVideoIndex === 0}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={() => setCurrentVideoIndex(i => Math.min(completedVideoClips.length - 1, i + 1))}
                          disabled={currentVideoIndex === completedVideoClips.length - 1}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                    {/* 片段指示器 */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                      {completedVideoClips.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentVideoIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentVideoIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : task.status === 'processing' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Loader2 className="w-16 h-16 text-ambient-purple animate-spin mb-4" />
                    <p className="text-luxury-400">视频生成中...</p>
                    <p className="text-luxury-500 text-sm mt-2">
                      已完成 {completedVideoClips.length}/{task.clips.length} 个片段
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Clapperboard className="w-16 h-16 text-luxury-600 mb-4" />
                    <p className="text-luxury-400">暂无生成完成的视频</p>
                  </div>
                )}
              </div>
              
              {/* 视频信息 - 移除了下载按钮 */}
              <div className="p-4 border-t border-glass-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{task.name}</h2>
                    <p className="text-sm text-luxury-400 mt-1">
                      片段 {currentVideoIndex + 1}: {completedVideoClips[currentVideoIndex]?.prompt?.substring(0, 50)}...
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm text-white ${getStatusColor(task.status)}`}>
                    {getStatusText(task.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* 视频片段列表 - 增加了按钮 */}
            <div className="card p-4">
              <h3 className="text-base font-medium text-white mb-4">视频片段 ({task.clips.length}个)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {task.clips.map((clip, idx) => (
                  <div key={clip.id || idx} className="space-y-2">
                    {/* 视频预览区域 - 带封面和播放按钮 */}
                    <button
                      onClick={() => {
                        if (clip.status === 'completed' && clip.videoUrl) {
                          const completedIdx = completedVideoClips.findIndex(c => c.id === clip.id)
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
                          {/* 封面图 + 播放按钮 */}
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
                          {/* 播放按钮覆盖层 */}
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
                      {/* 下载按钮 */}
                      {clip.status === 'completed' && clip.videoUrl && (
                        <button
                          onClick={() => handleDownload(clip.videoUrl!, `片段${idx + 1}.mp4`)}
                          className="flex-1 flex items-center justify-center px-2 py-1.5 bg-luxury-800 hover:bg-luxury-700 rounded text-xs text-luxury-300 transition-colors"
                          title="下载"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      )}
                      {/* 查看提示词按钮 */}
                      <button
                        onClick={() => handleShowPrompt(clip)}
                        className="flex-1 flex items-center justify-center px-2 py-1.5 bg-luxury-800 hover:bg-luxury-700 rounded text-xs text-luxury-300 transition-colors"
                        title="查看提示词"
                      >
                        <FileText className="w-3 h-3" />
                      </button>
                      {/* 修改视频按钮 */}
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
              
              {/* 合成视频按钮 - 放在右下角 */}
              {completedVideoClips.length > 0 && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleMergeVideos}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ambient-purple to-ambient-pink text-white rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Film className="w-5 h-5" />
                    合成视频
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 右侧信息面板 */}
          <div className="space-y-4">
            {/* 任务信息 */}
            <div className="card p-4">
              <h3 className="text-base font-medium text-white mb-4">任务信息</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-luxury-400">产品名称</span>
                  <span className="text-sm text-white">{task.productName || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-luxury-400">电影名称</span>
                  <span className="text-sm text-white">{task.movieName || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-luxury-400">时长</span>
                  <span className="text-sm text-white">{task.duration}秒</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-luxury-400">画幅</span>
                  <span className="text-sm text-white">{task.aspectRatio}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-luxury-400">创建时间</span>
                  <span className="text-sm text-white">
                    {new Date(task.createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="card p-4">
              <h3 className="text-base font-medium text-white mb-4">生成统计</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-luxury-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-semibold text-green-400">{completedVideoClips.length}</p>
                  <p className="text-xs text-luxury-500">已完成</p>
                </div>
                <div className="bg-luxury-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-semibold text-blue-400">{task.clips.filter(c => c.status === 'processing').length}</p>
                  <p className="text-xs text-luxury-500">生成中</p>
                </div>
                <div className="bg-luxury-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-semibold text-red-400">{failedVideoClips.length}</p>
                  <p className="text-xs text-luxury-500">失败</p>
                </div>
                <div className="bg-luxury-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-semibold text-yellow-400">{task.clips.filter(c => c.status === 'pending').length}</p>
                  <p className="text-xs text-luxury-500">等待中</p>
                </div>
              </div>
            </div>

            {/* 剧本预览 */}
            {task.script && (
              <div className="card p-4">
                <h3 className="text-base font-medium text-white mb-4">剧本内容</h3>
                <div className="bg-luxury-900/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <p className="text-sm text-luxury-300 whitespace-pre-wrap">{task.script}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="确认删除"
        message="确定要删除这个视频任务吗？此操作不可恢复。"
        confirmText="删除"
        cancelText="取消"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(false)}
      />
      
      {/* Prompt Dialog */}
      <AnimatePresence>
        {promptDialog && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setPromptDialog(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-luxury-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">片段提示词</h3>
                <button onClick={() => setPromptDialog(false)} className="text-luxury-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-luxury-800/50 rounded-lg p-4 overflow-y-auto flex-1">
                <pre className="text-sm text-luxury-300 whitespace-pre-wrap font-mono">{selectedPrompt}</pre>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setPromptDialog(false)}
                  className="px-4 py-2 bg-luxury-700 text-white rounded-lg hover:bg-luxury-600"
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Regenerate Dialog */}
      <AnimatePresence>
        {regenerateDialog && regenerateVideoClip && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setRegenerateDialog(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-luxury-900 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">重新生成视频片段</h3>
                <button onClick={() => setRegenerateDialog(false)} className="text-luxury-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Video preview */}
              {regenerateVideoUrl && (
                <div className="mb-4">
                  <video
                    ref={videoRef}
                    src={regenerateVideoUrl}
                    controls
                    className="w-full aspect-video rounded-lg"
                  />
                </div>
              )}
              
              {/* Prompt input */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <label className="text-sm text-luxury-400 mb-2">修改提示词</label>
                <textarea
                  value={regeneratePrompt}
                  onChange={(e) => setRegeneratePrompt(e.target.value)}
                  className="flex-1 bg-luxury-800/50 border border-luxury-700 rounded-lg p-3 text-white text-sm resize-none min-h-[150px]"
                  placeholder="输入视频生成提示词..."
                />
              </div>
              
              {/* Status */}
              {regenerateStatus === 'modifying' && (
                <div className="mt-4 flex items-center gap-2 text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">正在提交修改任务...</span>
                </div>
              )}
              
              {regenerateStatus === 'completed' && (
                <div className="mt-4 flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">修改完成！新视频已生成</span>
                </div>
              )}
              
              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setRegenerateDialog(false)}
                  className="px-4 py-2 bg-luxury-700 text-white rounded-lg hover:bg-luxury-600"
                >
                  关闭
                </button>
                {regenerateStatus !== 'modifying' && regenerateStatus !== 'completed' && (
                  <button
                    onClick={handleSubmitRegenerate}
                    disabled={!regeneratePrompt.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    确认修改
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
