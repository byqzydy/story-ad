import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Play, Pause, Download, 
  Loader2, Check, Film, Grid, List, Edit
} from 'lucide-react'
import { getVideoTask, type VideoTask } from '../services/videoTaskService'

export default function FinalWork() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<VideoTask | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('single')
  const videoRef = useRef<HTMLVideoElement>(null)
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (taskId) {
      loadTask()
    }
  }, [taskId])

  // Auto-play through all clips
  useEffect(() => {
    if (isPlaying && viewMode === 'single') {
      const completedClips = task?.clips.filter(c => c.status === 'completed') || []
      
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev < completedClips.length - 1) {
            return prev + 1
          } else {
            // Loop back to first video
            setIsPlaying(false)
            return 0
          }
        })
      }, 5000) // Play each clip for 5 seconds
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = null
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [isPlaying, viewMode, task])

  // Sync video with current index
  useEffect(() => {
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(() => {})
    }
  }, [currentIndex, isPlaying])

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

  const handleDownloadAll = async () => {
    const completedClips = task?.clips.filter(c => c.status === 'completed') || []
    for (let i = 0; i < completedClips.length; i++) {
      const clip = completedClips[i]
      if (clip.videoUrl) {
        await handleDownload(clip.videoUrl, `片段${i + 1}.mp4`)
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500))
      }
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

  return (
    <div className="min-h-screen bg-luxury-950">
      {/* Header */}
      <header className="glass">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-glass-light rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4 text-luxury-300" />
            </button>
            <h1 className="text-lg font-semibold text-white">最终作品</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex bg-luxury-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('single')}
                className={`p-2 rounded ${viewMode === 'single' ? 'bg-luxury-700 text-white' : 'text-luxury-400 hover:text-white'}`}
                title="单视频播放"
              >
                <Play className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-luxury-700 text-white' : 'text-luxury-400 hover:text-white'}`}
                title="网格视图"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
            {/* Download all button */}
            {completedClips.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-2 px-4 py-2 bg-luxury-800 text-luxury-300 rounded-lg hover:bg-luxury-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                下载全部
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-6">
        {/* Task info */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{task.name}</h2>
              <p className="text-sm text-luxury-400 mt-1">
                共 {completedClips.length} 个视频片段 | 总时长 {task.duration}秒
              </p>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <Check className="w-5 h-5" />
              <span>全部生成完成</span>
            </div>
          </div>
        </div>

        {/* Video display */}
        {viewMode === 'single' ? (
          /* Single video mode */
          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="relative aspect-video bg-black">
                {completedClips.length > 0 ? (
                  <>
                    <video
                      key={currentIndex}
                      ref={videoRef}
                      src={completedClips[currentIndex]?.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                      onEnded={() => {
                        if (isPlaying && currentIndex < completedClips.length - 1) {
                          setCurrentIndex(prev => prev + 1)
                        }
                      }}
                    />
                    {/* Progress bar */}
                    <div className="absolute bottom-16 left-0 right-0 px-4">
                      <div className="flex justify-center gap-2">
                        {completedClips.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setCurrentIndex(idx)
                              if (isPlaying) {
                                setIsPlaying(false)
                              }
                            }}
                            className={`w-3 h-3 rounded-full transition-all ${
                              idx === currentIndex 
                                ? 'bg-white scale-125' 
                                : idx < currentIndex 
                                  ? 'bg-green-400' 
                                  : 'bg-white/30 hover:bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Video info */}
                    <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-2 rounded-lg">
                      <p className="text-white text-sm">
                        片段 {currentIndex + 1} / {completedClips.length}
                      </p>
                      <p className="text-luxury-400 text-xs">
                        {completedClips[currentIndex]?.startTime}-{completedClips[currentIndex]?.endTime}秒
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Film className="w-16 h-16 text-luxury-600 mb-4" />
                    <p className="text-luxury-400">暂无视频</p>
                  </div>
                )}
              </div>
              
              {/* Controls */}
              <div className="p-4 border-t border-glass-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      disabled={completedClips.length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? '暂停' : '自动播放'}
                    </button>
                    <span className="text-sm text-luxury-400">
                      连续播放所有片段
                    </span>
                  </div>
                  
                  {completedClips[currentIndex]?.videoUrl && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/video-detail/${taskId}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-luxury-800 text-luxury-300 rounded-lg hover:bg-luxury-700 transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        剪辑
                      </button>
                      <button
                        onClick={() => handleDownload(
                          completedClips[currentIndex].videoUrl!, 
                          `片段${currentIndex + 1}.mp4`
                        )}
                        className="flex items-center gap-2 px-4 py-2 bg-luxury-800 text-luxury-300 rounded-lg hover:bg-luxury-700 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        下载当前
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Grid view mode */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {completedClips.map((clip, idx) => (
              <motion.div
                key={clip.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card overflow-hidden"
              >
                <div className="relative aspect-video bg-black group">
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
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => {
                        setCurrentIndex(idx)
                        setViewMode('single')
                      }}
                      className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    >
                      <Play className="w-6 h-6 text-white ml-1" />
                    </button>
                  </div>
                  <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/70 rounded text-xs text-white">
                    {idx + 1} / {completedClips.length}
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-luxury-400">
                      {clip.startTime}-{clip.endTime}秒
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/video-detail/${taskId}`)}
                        className="p-1.5 hover:bg-luxury-800 rounded text-luxury-400 hover:text-white transition-colors"
                        title="剪辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(clip.videoUrl!, `片段${idx + 1}.mp4`)}
                        className="p-1.5 hover:bg-luxury-800 rounded text-luxury-400 hover:text-white transition-colors"
                        title="下载"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Video clips list */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">视频片段列表</h3>
          <div className="space-y-2">
            {task.clips.map((clip, idx) => (
              <div 
                key={clip.id || idx}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  clip.status === 'completed' 
                    ? 'bg-luxury-800/50' 
                    : clip.status === 'processing'
                      ? 'bg-blue-900/20'
                      : 'bg-luxury-900/50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-luxury-700 flex items-center justify-center text-white text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">
                    {clip.startTime}-{clip.endTime}秒
                  </p>
                  <p className="text-xs text-luxury-500 truncate max-w-md">
                    {clip.prompt?.substring(0, 80)}...
                  </p>
                </div>
                {clip.status === 'completed' && clip.videoUrl && (
                  <button
                    onClick={() => handleDownload(clip.videoUrl!, `片段${idx + 1}.mp4`)}
                    className="p-2 hover:bg-luxury-700 rounded text-luxury-400 hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                {clip.status === 'processing' && (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                )}
                {clip.status === 'failed' && (
                  <span className="text-xs text-red-400">失败</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
