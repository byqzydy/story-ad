import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Play, Pause, Heart, Star, Share2, Download, 
  MoreHorizontal, Clock, Eye, User, Settings, Shield
} from 'lucide-react'
import { useStore } from '../store'

export default function Detail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, user } = useStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const project = projects.find(p => p.id === id) || projects[0]

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <header className="bg-white border-b border-dark-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-dark-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-dark-600" />
            </button>
            <h1 className="text-xl font-semibold text-dark-800">作品详情</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              分享
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Download className="w-5 h-5" />
              下载
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black rounded-3xl overflow-hidden aspect-video relative"
            >
              {/* Video Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                       onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-white" />
                    ) : (
                      <Play className="w-10 h-10 text-white ml-1" />
                    )}
                  </div>
                  <p className="text-dark-400">视频预览区域</p>
                </div>
              </div>

              {/* Waterermark */}
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white/60 text-sm">
                创影AI生成
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div className="h-full bg-primary-500 w-1/3" />
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isLiked ? 'bg-red-50 text-red-500' : 'bg-white border border-dark-200 text-dark-600 hover:bg-dark-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  {project.likes + (isLiked ? 1 : 0)}
                </button>
                <button 
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isFavorited ? 'bg-yellow-50 text-yellow-500' : 'bg-white border border-dark-200 text-dark-600 hover:bg-dark-50'
                  }`}
                >
                  <Star className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  收藏
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-dark-200 text-dark-600 rounded-xl hover:bg-dark-50 transition-all">
                  <Share2 className="w-5 h-5" />
                  分享
                </button>
              </div>
              <div className="flex items-center gap-4 text-dark-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {project.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {project.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Title & Author */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-dark-800 mb-4">{project.title}</h2>
              <div className="flex items-center gap-3">
                <img 
                  src={project.author.avatar} 
                  alt={project.author.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium text-dark-800">{project.author.name}</p>
                  <p className="text-sm text-dark-500">
                    {project.author.level === 'bronze' && '🥉 青铜创作者'}
                    {project.author.level === 'silver' && '🥈 白银创作者'}
                    {project.author.level === 'gold' && '🥇 黄金创作者'}
                    {project.author.level === 'platinum' && '💎 铂金创作者'}
                    {project.author.level === 'diamond' && '👑 钻石创作者'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-dark-800 mb-4">创作数据</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary-600">
                    {project.views.toLocaleString()}
                  </p>
                  <p className="text-sm text-dark-500">播放量</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">
                    {project.likes.toLocaleString()}
                  </p>
                  <p className="text-sm text-dark-500">点赞数</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">
                    {project.favorites}
                  </p>
                  <p className="text-sm text-dark-500">收藏数</p>
                </div>
              </div>
            </div>

            {/* Config */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-dark-800 mb-4">创作配置</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-500">故事类型</span>
                  <span className="text-dark-800">{project.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-500">风格</span>
                  <span className="text-dark-800">{project.style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-500">时长</span>
                  <span className="text-dark-800">{project.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-500">创作时间</span>
                  <span className="text-dark-800">{project.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Similar Works */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-dark-800 mb-4">相似推荐</h3>
              <div className="space-y-3">
                {projects.slice(0, 3).filter(p => p.id !== id).map(p => (
                  <Link 
                    key={p.id}
                    to={`/detail/${p.id}`}
                    className="flex gap-3 group"
                  >
                    <img 
                      src={p.thumbnail} 
                      alt={p.title}
                      className="w-20 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-dark-800 text-sm font-medium truncate group-hover:text-primary-600 transition-colors">
                        {p.title}
                      </p>
                      <p className="text-dark-400 text-xs">{p.views}播放</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
