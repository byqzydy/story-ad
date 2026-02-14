import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, User, Settings, LogOut, Play, Heart, Star,
  Grid, List, Download, Trash2, MoreHorizontal, Video,
  Image, Music, FolderOpen, ChevronRight
} from 'lucide-react'
import { useStore } from '../store'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, projects } = useStore()
  const [activeTab, setActiveTab] = useState<'published' | 'drafts' | 'favorites'>('published')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const levelInfo = {
    bronze: { name: '青铜创作者', progress: 20, next: '白银', need: 80 },
    silver: { name: '白银创作者', progress: 40, next: '黄金', need: 60 },
    gold: { name: '黄金创作者', progress: 60, next: '铂金', need: 40 },
    platinum: { name: '铂金创作者', progress: 80, next: '钻石', need: 20 },
    diamond: { name: '钻石创作者', progress: 100, next: '', need: 0 }
  }

  const currentLevel = user ? levelInfo[user.level] : levelInfo.bronze

  const filteredProjects = projects.filter(p => {
    if (activeTab === 'published') return p.status === 'published'
    if (activeTab === 'drafts') return p.status === 'draft'
    return true // favorites - show all for demo
  })

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <header className="bg-white border-b border-dark-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-dark-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-dark-600" />
            </button>
            <h1 className="text-xl font-semibold text-dark-800">个人中心</h1>
          </div>
          <button 
            onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-2 text-dark-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-center">
                <img 
                  src={user?.avatar || 'https://i.pravatar.cc/100'} 
                  alt="avatar"
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold text-dark-800">
                  {user?.name || '用户'}
                </h2>
                <p className="text-dark-500 text-sm">
                  {currentLevel.name}
                </p>
                
                {/* Level Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-dark-500 mb-1">
                    <span>等级经验</span>
                    {currentLevel.need > 0 && (
                      <span>距离{currentLevel.next}还需{currentLevel.need}创作</span>
                    )}
                  </div>
                  <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                      style={{ width: `${currentLevel.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-dark-800 mb-4">创作统计</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-dark-500 flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    累计生成
                  </span>
                  <span className="font-semibold text-dark-800">
                    {user?.totalGenerations || 0} 次
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-500 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    获赞总数
                  </span>
                  <span className="font-semibold text-dark-800">
                    {user?.totalLikes || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-500 flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    总播放量
                  </span>
                  <span className="font-semibold text-dark-800">
                    {user?.totalViews || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {[
                { icon: User, label: '个人资料', active: false },
                { icon: Video, label: '我的作品', active: true },
                { icon: FolderOpen, label: '资产管理', active: false },
                { icon: Star, label: '我的收藏', active: false },
                { icon: Settings, label: '账号设置', active: false },
              ].map((item, idx) => (
                <button
                  key={idx}
                  className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                    item.active 
                      ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500' 
                      : 'text-dark-600 hover:bg-dark-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl p-2 shadow-sm flex items-center justify-between">
              <div className="flex gap-2">
                {[
                  { id: 'published', label: '已发布', icon: Play },
                  { id: 'drafts', label: '草稿箱', icon: Video },
                  { id: 'favorites', label: '我的收藏', icon: Heart },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white'
                        : 'text-dark-600 hover:bg-dark-100'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-dark-400'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-dark-400'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Projects Grid */}
            {viewMode === 'grid' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <Link to={`/detail/${project.id}`}>
                      <div className="relative aspect-video">
                        <img 
                          src={project.thumbnail} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-xs">
                          {project.duration}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-dark-800 mb-2 truncate">
                          {project.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-dark-500">
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {project.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {project.likes}
                          </span>
                          <span>{project.createdAt}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {filteredProjects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-4 p-4 border-b border-dark-100 hover:bg-dark-50 transition-colors"
                  >
                    <Link to={`/detail/${project.id}`}>
                      <img 
                        src={project.thumbnail} 
                        alt={project.title}
                        className="w-32 h-20 rounded-xl object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/detail/${project.id}`}>
                        <h3 className="font-semibold text-dark-800 truncate hover:text-primary-600 transition-colors">
                          {project.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-4 mt-1 text-sm text-dark-500">
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {project.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {project.likes}
                        </span>
                        <span>{project.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-dark-100 rounded-lg transition-colors">
                        <Download className="w-5 h-5 text-dark-400" />
                      </button>
                      <button className="p-2 hover:bg-dark-100 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5 text-dark-400" />
                      </button>
                      <button className="p-2 hover:bg-dark-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-dark-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-dark-100 rounded-full flex items-center justify-center">
                  <Video className="w-10 h-10 text-dark-400" />
                </div>
                <h3 className="text-xl font-semibold text-dark-800 mb-2">
                  {activeTab === 'published' ? '暂无作品' : 
                   activeTab === 'drafts' ? '草稿箱为空' : '暂无收藏'}
                </h3>
                <p className="text-dark-500 mb-6">
                  {activeTab === 'published' ? '开始创作您的第一个广告作品吧' : 
                   activeTab === 'drafts' ? '保存的草稿会显示在这里' : '收藏的作品会显示在这里'}
                </p>
                <button 
                  onClick={() => navigate('/create')}
                  className="btn-primary"
                >
                  立即创作
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
