import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Play, Pause, Download, Trash2, Share2, 
  Clock, Film, Smartphone, Monitor, Loader2, Check, X, ChevronLeft, ChevronRight,
  Sparkles, User, Clapperboard
} from 'lucide-react'
import { getVideoTask, deleteVideoTask, retryVideoTask, type VideoTask } from '../services/videoTaskService'
import ConfirmDialog from '../components/ConfirmDialog'

export default function VideoDetail() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<VideoTask | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => {
    if (taskId) {
      loadTask()
    }
  }, [taskId])

  const loadTask = async () => {
    try {
      const data = await getVideoTask(taskId!)
      setTask(data)
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

  const completedClips = task.clips.filter(c => c.status === 'completed')
  const failedClips = task.clips.filter(c => c.status === 'failed')

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
            <button 
              onClick={handleRetry}
              disabled={task.status === 'processing' || (failedClips.length === 0 && completedClips.length > 0)}
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
                {completedClips.length > 0 ? (
                  <>
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
                  </>
                ) : task.status === 'processing' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Loader2 className="w-16 h-16 text-ambient-purple animate-spin mb-4" />
                    <p className="text-luxury-400">视频生成中...</p>
                    <p className="text-luxury-500 text-sm mt-2">
                      已完成 {completedClips.length}/{task.clips.length} 个片段
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Clapperboard className="w-16 h-16 text-luxury-600 mb-4" />
                    <p className="text-luxury-400">暂无生成完成的视频</p>
                  </div>
                )}
              </div>
              
              {/* 视频信息 */}
              <div className="p-4 border-t border-glass-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{task.name}</h2>
                    <p className="text-sm text-luxury-400 mt-1">
                      片段 {currentVideoIndex + 1}: {completedClips[currentVideoIndex]?.prompt?.substring(0, 50)}...
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm text-white ${getStatusColor(task.status)}`}>
                    {getStatusText(task.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* 视频片段列表 */}
            <div className="card p-4">
              <h3 className="text-base font-medium text-white mb-4">视频片段 ({task.clips.length}个)</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {task.clips.map((clip, idx) => (
                  <button
                    key={clip.id || idx}
                    onClick={() => {
                      if (clip.status === 'completed' && clip.videoUrl) {
                        const completedIdx = completedClips.findIndex(c => c.id === clip.id)
                        if (completedIdx !== -1) {
                          setCurrentVideoIndex(completedIdx)
                        }
                      }
                    }}
                    disabled={clip.status !== 'completed'}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      clip.status === 'completed' 
                        ? 'border-transparent hover:border-primary cursor-pointer' 
                        : 'border-luxury-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {clip.status === 'completed' && clip.videoUrl ? (
                      <>
                        <video
                          src={clip.videoUrl}
                          className="w-full h-full object-cover"
                          muted
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause()
                            e.currentTarget.currentTime = 0
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : clip.status === 'processing' ? (
                      <div className="w-full h-full flex items-center justify-center bg-luxury-800">
                        <Loader2 className="w-6 h-6 text-luxury-500 animate-spin" />
                      </div>
                    ) : clip.status === 'failed' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-luxury-800">
                        <X className="w-6 h-6 text-red-500" />
                        <span className="text-xs text-red-400 mt-1">失败</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-luxury-800">
                        <Clock className="w-6 h-6 text-luxury-500" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white">
                      {clip.startTime}-{clip.endTime}秒
                    </div>
                  </button>
                ))}
              </div>
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
                  <p className="text-2xl font-semibold text-green-400">{completedClips.length}</p>
                  <p className="text-xs text-luxury-500">已完成</p>
                </div>
                <div className="bg-luxury-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-semibold text-blue-400">{task.clips.filter(c => c.status === 'processing').length}</p>
                  <p className="text-xs text-luxury-500">生成中</p>
                </div>
                <div className="bg-luxury-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-semibold text-red-400">{failedClips.length}</p>
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
    </div>
  )
}
