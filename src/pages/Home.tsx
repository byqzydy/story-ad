import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Play, Heart, Eye, Star, Zap, Shield, Sparkles, ChevronDown, Filter, X, User, LogOut } from 'lucide-react'
import { useStore } from '../store'

// Navbar Component
function Navbar() {
  const { user, isLoggedIn, logout } = useStore()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-200/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-display font-bold gradient-text">创影</span>
        </Link>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <button 
                onClick={() => navigate('/create')}
                className="btn-primary flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                立即创作
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-dark-100 transition-colors"
                >
                  <img 
                    src={user?.avatar || 'https://i.pravatar.cc/100'} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full"
                  />
                  <ChevronDown className="w-4 h-4 text-dark-500" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-dark-200 overflow-hidden">
                    <button 
                      onClick={() => { navigate('/profile'); setShowUserMenu(false) }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-dark-50 transition-colors text-left"
                    >
                      <User className="w-4 h-4" />
                      个人中心
                    </button>
                    <button 
                      onClick={() => { logout(); setShowUserMenu(false) }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-dark-50 transition-colors text-left text-red-500"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/pricing" className="btn-ghost">价格</Link>
              <Link to="/login" className="btn-secondary">登录</Link>
              <button 
                onClick={() => navigate('/login')}
                className="btn-primary"
              >
                立即创作
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

// Hero Section
function Hero() {
  const navigate = useNavigate()
  const projects = useStore((s) => s.projects)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary-500/10 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
            让每个商家都能
            <br />
            <span className="gradient-text">讲好自己的品牌故事</span>
          </h1>
          <p className="text-xl md:text-2xl text-dark-300 mb-10 max-w-2xl mx-auto">
            5分钟完成创意策划，10分钟生成专业级广告视频
            <br />
            <span className="text-dark-400">成本降低90%，效果媲美万元级制作</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/create')}
              className="btn-primary text-lg px-8 py-4"
            >
              <Zap className="w-6 h-6 inline-block mr-2" />
              立即创作
            </button>
            <button className="btn-secondary text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10">
              查看案例
            </button>
          </div>
        </motion.div>

        {/* Featured Works Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20"
        >
          <p className="text-dark-400 mb-6">最新优秀作品</p>
          <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 justify-center">
            {projects.slice(0, 4).map((project, idx) => (
              <div 
                key={project.id}
                className="flex-shrink-0 w-72 group cursor-pointer"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="relative rounded-2xl overflow-hidden aspect-video mb-3">
                  <img 
                    src={project.thumbnail} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex items-center gap-3 text-white">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {project.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {project.likes}
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-sm">
                    {project.duration}
                  </div>
                </div>
                <h3 className="text-white font-medium truncate">{project.title}</h3>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Trust Badges */}
      <div className="absolute bottom-0 left-0 right-0 py-8 bg-gradient-to-t from-dark-900 to-transparent">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-8">
          <div className="flex items-center gap-2 text-dark-400">
            <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-400" />
            </div>
            <span>已生成10万+广告</span>
          </div>
          <div className="flex items-center gap-2 text-dark-400">
            <div className="w-10 h-10 bg-accent-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-400" />
            </div>
            <span>即梦AI官方合作</span>
          </div>
          <div className="flex items-center gap-2 text-dark-400">
            <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-400" />
            </div>
            <span>DeepSeek技术加持</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// Works Section
function WorksSection() {
  const projects = useStore((s) => s.projects)
  const [filterCategory, setFilterCategory] = useState('全部')
  const [filterStyle, setFilterStyle] = useState('全部')
  const [showFilters, setShowFilters] = useState(false)

  const categories = ['全部', '美妆', '食品', '服装', '3C', '宠物']
  const styles = ['全部', '温馨', '搞笑', '励志', '清爽', '科技', '感人', '促销']

  const filteredProjects = projects.filter(p => {
    if (filterCategory !== '全部' && p.category !== filterCategory) return false
    if (filterStyle !== '全部' && p.style !== filterStyle) return false
    return true
  })

  return (
    <section className="py-20 bg-dark-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-display font-bold text-dark-800">作品广场</h2>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-dark-200 hover:border-primary-500 transition-colors"
          >
            <Filter className="w-4 h-4" />
            筛选
            {(filterCategory !== '全部' || filterStyle !== '全部') && (
              <span className="w-2 h-2 bg-primary-500 rounded-full" />
            )}
          </button>
        </div>

        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 p-6 bg-white rounded-2xl border border-dark-200"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-3">行业</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                        filterCategory === cat 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-3">风格</label>
                <div className="flex flex-wrap gap-2">
                  {styles.map(style => (
                    <button
                      key={style}
                      onClick={() => setFilterStyle(style)}
                      className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                        filterStyle === style 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="card group cursor-pointer"
            >
              <Link to={`/detail/${project.id}`}>
                <div className="relative rounded-2xl overflow-hidden aspect-video mb-4">
                  <img 
                    src={project.thumbnail} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <div className="flex items-center gap-3 text-white">
                      <span className="flex items-center gap-1 text-sm">
                        <Eye className="w-4 h-4" />
                        {project.views}
                      </span>
                      <span className="flex items-center gap-1 text-sm">
                        <Heart className="w-4 h-4" />
                        {project.likes}
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-xs">
                    {project.duration}
                  </div>
                </div>
                <h3 className="font-semibold text-dark-800 mb-2 truncate group-hover:text-primary-600 transition-colors">
                  {project.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src={project.author.avatar} 
                      alt={project.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-dark-500">{project.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-dark-400">
                    <Star className="w-3 h-3 text-yellow-400" />
                    {project.category}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Templates Section
function TemplatesSection() {
  const templates = useStore((s) => s.templates)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-display font-bold text-dark-800 mb-10">热门模板</h2>
        <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4">
          {templates.map((template, idx) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="flex-shrink-0 w-72 group cursor-pointer"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[3/2] mb-4">
                <img 
                  src={template.thumbnail} 
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-3 py-1 bg-primary-500/80 backdrop-blur-sm rounded-full text-white text-xs mb-2">
                    {template.category}
                  </span>
                  <h3 className="text-white font-semibold">{template.name}</h3>
                </div>
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-xs">
                  {template.usageCount.toLocaleString()}次使用
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Pricing Preview Section
function PricingPreview() {
  const navigate = useNavigate()

  const plans = [
    {
      name: '免费版',
      price: '¥0',
      period: '',
      features: ['3次/月', '15秒', '720P', '有水印'],
      highlight: false
    },
    {
      name: '月度会员',
      price: '¥49',
      period: '/月',
      features: ['50次/月', '60秒', '1080P', '去水印', '高速通道', 'AI音效'],
      highlight: true
    },
    {
      name: '年度会员',
      price: '¥299',
      period: '/年',
      features: ['100次+/月', '120秒', '2K', '去水印', '极速通道', '全库音效', '专属客服'],
      highlight: false
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            简单透明的定价
          </h2>
          <p className="text-dark-400">选择最适合您的创作套餐</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative p-6 rounded-2xl ${
                plan.highlight 
                  ? 'bg-gradient-to-b from-primary-500 to-primary-600 border-2 border-primary-400' 
                  : 'bg-white/10 border border-white/20'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-500 text-white text-sm rounded-full">
                  最受欢迎
                </div>
              )}
              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-dark-300">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-dark-200">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.highlight ? 'bg-white/20' : 'bg-primary-500/20'
                    }`}>
                      <Sparkles className={`w-3 h-3 ${plan.highlight ? 'text-white' : 'text-primary-400'}`} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => navigate('/pricing')}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.highlight 
                    ? 'bg-white text-primary-600 hover:bg-dark-50' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                查看详情
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  const links = {
    '产品功能': ['智能创作', '模板库', '素材库', '团队协作'],
    '定价': ['免费版', '月度会员', '年度会员', '增值服务'],
    '帮助中心': ['新手教程', '常见问题', '使用指南', '联系客服'],
    '关于我们': ['公司介绍', '媒体报道', '加入我们', '隐私政策']
  }

  return (
    <footer className="bg-dark-900 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-white">创影</span>
            </Link>
            <p className="text-dark-400 text-sm">
              AI驱动的故事化广告生成平台
            </p>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-dark-400 hover:text-primary-400 transition-colors text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-dark-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-dark-500 text-sm">
            © 2026 创影科技 All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-dark-500 hover:text-primary-400 transition-colors">
              <Shield className="w-5 h-5" />
            </a>
            <a href="#" className="text-dark-500 hover:text-primary-400 transition-colors">
              <Sparkles className="w-5 h-5" />
            </a>
            <a href="#" className="text-dark-500 hover:text-primary-400 transition-colors">
              <Zap className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main Home Component
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <WorksSection />
      <TemplatesSection />
      <PricingPreview />
      <Footer />
    </div>
  )
}
