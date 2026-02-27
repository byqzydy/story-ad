import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Package, Megaphone, Tag, Crown, User, LogOut, Layers, Bot, Clapperboard } from 'lucide-react'
import { useStore } from '../store'
import { useState } from 'react'
import LoginModal from '../components/LoginModal'

// Navbar for Creation Guide Page
function Navbar({ creationMode, onModeChange }: { creationMode: string; onModeChange: (mode: string) => void }) {
  const { user, isLoggedIn, logout, setShowLoginModal } = useStore()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-r from-ambient-blue via-ambient-purple to-ambient-cyan">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold gradient-text tracking-tight">虹忆坊</span>
        </Link>

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
          <Link to="/pricing" className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-ambient-purple to-ambient-pink text-white text-sm rounded-lg hover:opacity-90 transition-opacity">
            <Crown className="w-4 h-4" />购买会员
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
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    icon: Package,
    color: 'from-ambient-blue to-ambient-cyan'
  },
  {
    id: 'brand',
    title: '品牌广告',
    description: '传递品牌理念，提升品牌知名度',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    icon: Megaphone,
    color: 'from-ambient-purple to-ambient-pink'
  },
  {
    id: 'promotion',
    title: '促销广告',
    description: '限时优惠活动，激发用户购买欲',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80',
    icon: Tag,
    color: 'from-ambient-orange to-ambient-red'
  }
]

export default function CreationGuide() {
  const navigate = useNavigate()
  const { isLoggedIn, setShowLoginModal, setShowWelcomeGiftAfterLogin } = useStore()
  const [creationMode, setCreationMode] = useState('free')

  const handleModeChange = (mode: string) => {
    setCreationMode(mode)
    if (mode === 'ai') {
      if (!isLoggedIn) {
        setShowWelcomeGiftAfterLogin(true)
        setShowLoginModal(true)
        return
      }
      navigate('/ai-agent')
    } else if (mode === 'movie') {
      if (!isLoggedIn) {
        setShowWelcomeGiftAfterLogin(true)
        setShowLoginModal(true)
        return
      }
      navigate('/movie-placement')
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

      <main className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-glass-light rounded-full border border-glass-border mb-4">
                <Sparkles className="w-3.5 h-3.5 text-ambient-purple" />
                <span className="text-xs text-luxury-300">选择您的创作类型</span>
              </div>
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
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-950/80 via-luxury-950/20 to-transparent" />
                    
                    {/* Icon Badge */}
                    <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-lg`}>
                      <type.icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-luxury-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                        开始创作
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary transition-colors">
                      {type.title}
                    </h3>
                    <p className="text-sm text-luxury-400">
                      {type.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 p-6 bg-luxury-900/50 rounded-2xl border border-glass-border"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-ambient-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-ambient-blue" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-1">创作提示</h4>
                <p className="text-xs text-luxury-400">
                  不同类型的广告适用于不同的营销场景。产品广告适合展示具体商品特点，品牌广告适合建立品牌形象，促销广告适合限时活动和优惠推广。根据您的营销目标选择合适的类型效果最佳。
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <LoginModal />
    </div>
  )
}
