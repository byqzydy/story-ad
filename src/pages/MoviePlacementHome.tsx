import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Sparkles, Plus, Package, Megaphone, Tag, 
  ArrowLeft, Clapperboard, Film, Trash2, Play,
  Layers, Bot, Crown, User, LogOut
} from 'lucide-react'
import { useStore } from '../store'
import Logo from '../components/Logo'
import ConfirmDialog from '../components/ConfirmDialog'

const adTypes = [
  { 
    id: 'product', 
    title: '产品广告', 
    description: '展示产品特点与优势，吸引目标用户',
    image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&q=80',
    icon: Package,
    color: 'from-ambient-blue to-ambient-cyan'
  },
  { 
    id: 'brand', 
    title: '品牌广告', 
    description: '传递品牌理念，提升品牌知名度',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
    icon: Megaphone,
    color: 'from-ambient-purple to-ambient-pink'
  },
  { 
    id: 'promotion', 
    title: '促销广告', 
    description: '限时优惠活动，激发用户购买欲',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
    icon: Tag,
    color: 'from-ambient-orange to-ambient-red'
  }
]

// Navbar for Movie Placement Home Page (same style as CreationGuide)
function Navbar() {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout, setShowLoginModal } = useStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <Logo size="md" />

        {/* Creation Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-luxury-800/50 rounded-xl border border-glass-border">
          <button
            onClick={() => navigate('/create-guide')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-luxury-400 hover:text-white hover:bg-luxury-700"
          >
            <Layers className="w-4 h-4" />
            自由混合
          </button>
          <button
            onClick={() => navigate('/ai-agent-chat')}
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
  )
}

export default function MoviePlacementHome() {
  const navigate = useNavigate()
  const { movieProjects, deleteMovieProject } = useStore()
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    projectId: string | null
    projectName: string
  }>({ isOpen: false, projectId: null, projectName: '' })
  
  // 获取最新的4个项目
  const recentProjects = movieProjects.slice(0, 4)
  
  const handleDeleteProject = (e: React.MouseEvent, projectId: string, projectName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleteConfirm({
      isOpen: true,
      projectId,
      projectName
    })
  }
  
  const handleAdTypeClick = (typeId: string) => {
    navigate(`/movie-placement?type=${typeId}`)
  }

  return (
    <div className="min-h-screen bg-luxury-950">
      {/* Navbar */}
      <Navbar />

      <main className="pt-40 pb-12">
        <div className="max-w-6xl mx-auto px-8">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">
              将你的产品植入<span className="gradient-text">任何一部电影</span>
            </h1>
            <p className="text-luxury-400 text-base max-w-xl mx-auto">
              让经典角色为你做广告，打造独特的品牌记忆点
            </p>
          </motion.div>

          {/* Ad Type Entries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            {adTypes.map((type, idx) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
              >
                <div
                  onClick={() => handleAdTypeClick(type.id)}
                  className="group cursor-pointer"
                >
                  {/* Image Card */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-glass-border">
                    <img
                      src={type.image}
                      alt={type.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Title & Description on image */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <h3 className="text-xl font-semibold text-white mb-2 text-center">
                        {type.title}
                      </h3>
                      <p className="text-sm text-white/80 text-center">
                        {type.description}
                      </p>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-luxury-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                        开始创作
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">最近项目</h2>
            </div>
            
            <div className="grid grid-cols-5 gap-4">
              {/* New Project Entry */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="col-span-1"
              >
                <div
                  onClick={() => navigate('/movie-placement')}
                  className="aspect-video rounded-xl border-2 border-dashed border-luxury-600 hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-colors group bg-luxury-900/30"
                >
                  <div className="w-12 h-12 rounded-full bg-luxury-800 group-hover:bg-primary/20 flex items-center justify-center mb-2 transition-colors">
                    <Plus className="w-6 h-6 text-luxury-400 group-hover:text-primary" />
                  </div>
                  <span className="text-sm text-luxury-400 group-hover:text-white">新建项目</span>
                </div>
              </motion.div>

              {/* Project List (max 4) */}
              {recentProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + (idx + 1) * 0.1 }}
                  className="col-span-1"
                >
                  <div
                    onClick={() => navigate(`/movie-placement?projectId=${project.id}`)}
                    className="aspect-video rounded-xl overflow-hidden cursor-pointer group relative border-2 border-transparent hover:border-primary transition-all"
                  >
                    {project.productInfo.images && project.productInfo.images[0] ? (
                      <img 
                        src={project.productInfo.images[0]} 
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-luxury-800 flex items-center justify-center">
                        <Film className="w-8 h-8 text-luxury-600" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Play button on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                    
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                      className="absolute top-2 left-2 p-1.5 bg-red-500/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10"
                      title="删除项目"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                    
                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                      {project.duration}秒
                    </div>
                    
                    {/* Project info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-luxury-950/90 to-transparent">
                      <p className="text-xs text-white truncate font-medium">{project.name}</p>
                      <p className="text-xs text-luxury-400 truncate">{project.movieName || project.customMovie || '未选择电影'}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 4 - recentProjects.length) }).map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-video rounded-xl border border-dashed border-luxury-700/30" />
              ))}
            </div>
            </motion.div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="确认删除"
        message={`确定要删除"${deleteConfirm.projectName}"吗？此操作不可恢复。`}
        confirmText="删除"
        cancelText="取消"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirm.projectId) {
            deleteMovieProject(deleteConfirm.projectId)
          }
          setDeleteConfirm({ isOpen: false, projectId: null, projectName: '' })
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, projectId: null, projectName: '' })}
      />
    </div>
  )
}
