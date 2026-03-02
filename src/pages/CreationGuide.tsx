import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Package, Megaphone, Tag, Crown, User, LogOut, Layers, Bot, Clapperboard, FolderOpen, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { useState } from 'react'
import LoginModal from '../components/LoginModal'
import Logo from '../components/Logo'
import ConfirmDialog from '../components/ConfirmDialog'

// Navbar for Creation Guide Page
function Navbar({ creationMode, onModeChange }: { creationMode: string; onModeChange: (mode: string) => void }) {
  const { user, isLoggedIn, logout, setShowLoginModal } = useStore()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <Logo size="md" />

        {/* Creation Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-luxury-800/50 rounded-xl border border-glass-border">
          <button
            onClick={() => onModeChange('free')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              creationMode === 'free'
                ? 'bg-gradient-to-r from-ambient-blue to-ambient-purple text-white shadow-soft'
                : 'text-luxury-400 hover:text-white hover:bg-luxury-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            自由混合
          </button>
          <button
            onClick={() => onModeChange('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              creationMode === 'ai'
                ? 'bg-gradient-to-r from-ambient-blue to-ambient-purple text-white shadow-soft'
                : 'text-luxury-400 hover:text-white hover:bg-luxury-700'
            }`}
          >
            <Bot className="w-4 h-4" />
            智能代理
          </button>
          <button
            onClick={() => onModeChange('movie')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              creationMode === 'movie'
                ? 'bg-gradient-to-r from-ambient-blue to-ambient-purple text-white shadow-soft'
                : 'text-luxury-400 hover:text-white hover:bg-luxury-700'
            }`}
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

const creationTypes = [
  {
    id: 'product',
    title: '产品广告',
    description: '展示产品特点与优势，吸引目标用户',
    image: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=1200&q=80',
    icon: Package,
    color: 'from-ambient-blue to-ambient-cyan'
  },
  {
    id: 'brand',
    title: '品牌广告',
    description: '传递品牌理念，提升品牌知名度',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&q=80',
    icon: Megaphone,
    color: 'from-ambient-purple to-ambient-pink'
  },
  {
    id: 'promotion',
    title: '促销广告',
    description: '限时优惠活动，激发用户购买欲',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&q=80',
    icon: Tag,
    color: 'from-ambient-orange to-ambient-red'
  }
]

export default function CreationGuide() {
  const navigate = useNavigate()
  const { isLoggedIn, setShowLoginModal, setShowWelcomeGiftAfterLogin, adProjects, deleteAdProject } = useStore()
  const [creationMode, setCreationMode] = useState('free')
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    projectId: string | null
    projectName: string
  }>({ isOpen: false, projectId: null, projectName: '' })

  const handleModeChange = (mode: string) => {
    setCreationMode(mode)
    if (mode === 'ai') {
      if (!isLoggedIn) {
        setShowWelcomeGiftAfterLogin(true)
        setShowLoginModal(true)
        return
      }
      navigate('/ai-agent-chat')
    } else if (mode === 'movie') {
      if (!isLoggedIn) {
        setShowWelcomeGiftAfterLogin(true)
        setShowLoginModal(true)
        return
      }
      navigate('/movie-placement-home')
    }
  }

  const handleCreateClick = (type: string) => {
    if (!isLoggedIn) {
      setShowWelcomeGiftAfterLogin(true)
      setShowLoginModal(true)
      return
    }
    // Navigate to different create page based on type
    const routes: Record<string, string> = {
      product: '/create-product',
      brand: '/create-brand',
      promotion: '/create-promotion'
    }
    navigate(routes[type] || '/create-product')
  }

  return (
    <div className="min-h-screen bg-luxury-950">
      <Navbar creationMode={creationMode} onModeChange={handleModeChange} />

      <main className="pt-40 pb-12">
        <div className="max-w-6xl mx-auto px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">
                开始创作您的<span className="gradient-text">广告视频</span>
              </h1>
              <p className="text-luxury-400 text-base max-w-xl mx-auto">
                根据您的需求选择合适的广告类型，AI智能生成专业级视频内容
              </p>
            </motion.div>
          </div>

          {/* Creation Type Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {creationTypes.map((type, idx) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div
                  onClick={() => handleCreateClick(type.id)}
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
          </div>

          {/* Projects Section - matching 趣味玩法 style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16"
          >
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white">最近项目</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {/* Add Project Button */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="cursor-pointer group"
                onClick={() => {
                  if (!isLoggedIn) {
                    setShowWelcomeGiftAfterLogin(true)
                    setShowLoginModal(true)
                    return
                  }
                  navigate('/create-product')
                }}
              >
                <div className="aspect-video bg-luxury-800/50 border-2 border-dashed border-luxury-600 rounded-xl flex flex-col items-center justify-center gap-2 group-hover:border-primary transition-colors">
                  <div className="w-12 h-12 rounded-full bg-luxury-700/50 flex items-center justify-center group-hover:bg-luxury-700 group-hover:scale-110 transition-all duration-300">
                    <span className="text-3xl text-luxury-400 group-hover:text-white">+</span>
                  </div>
                  <span className="text-sm text-luxury-400">新建项目</span>
                </div>
              </motion.div>
              
              {/* Existing Projects */}
              {adProjects.map((project) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary transition-all relative rounded-xl"
                  onClick={() => navigate(`/create-product?projectId=${project.id}`, { state: { returnPath: '/create-guide' } })}
                >
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteConfirm({
                        isOpen: true,
                        projectId: project.id,
                        projectName: project.name
                      })
                    }}
                    className="absolute top-2 left-2 z-10 p-1.5 bg-red-500/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    title="删除项目"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                  <div className="relative aspect-video bg-luxury-800">
                    <img src={project.thumbnail || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400'} alt={project.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">继续编辑</span>
                    </div>
                    {/* Text on image with gradient background from bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-luxury-950 via-luxury-950/80 to-transparent">
                      <h4 className="font-medium text-white text-xs truncate">{project.name}</h4>
                      <p className="text-luxury-400 text-[10px]">{new Date(project.createdAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '')}</p>
                    </div>
                    {/* Duration at bottom right - above gradient */}
                    <div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 bg-luxury-950/60 backdrop-blur-sm rounded text-white text-xs">{project.storyConfig?.duration || '未知时长'}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <LoginModal />
      
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
            deleteAdProject(deleteConfirm.projectId)
          }
          setDeleteConfirm({ isOpen: false, projectId: null, projectName: '' })
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, projectId: null, projectName: '' })}
      />
    </div>
  )
}
