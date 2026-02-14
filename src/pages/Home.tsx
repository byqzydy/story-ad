import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Heart, Eye, Star, Zap, Shield, Sparkles, ChevronDown, Filter, User, LogOut } from 'lucide-react'
import { useStore } from '../store'

// Navbar
function Navbar() {
  const { user, isLoggedIn, logout } = useStore()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-glass-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink rounded-xl flex items-center justify-center shadow-neon">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-display font-bold gradient-text">创影</span>
        </Link>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <button onClick={() => navigate('/create')} className="btn-primary flex items-center gap-2">
                <Zap className="w-5 h-5" />
                立即创作
              </button>
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-2 rounded-xl hover:bg-glass-whiteHover transition-colors">
                  <img src={user?.avatar || 'https://i.pravatar.cc/100'} alt="avatar" className="w-8 h-8 rounded-full border-2 border-glass-border" />
                  <ChevronDown className="w-4 h-4 text-dark-300" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 rounded-xl shadow-card-dark border border-glass-border overflow-hidden">
                    <button onClick={() => { navigate('/profile'); setShowUserMenu(false) }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-glass-whiteHover transition-colors text-left">
                      <User className="w-4 h-4" />
                      个人中心
                    </button>
                    <button onClick={() => { logout(); setShowUserMenu(false) }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-glass-whiteHover transition-colors text-left text-red-400">
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
              <button onClick={() => navigate('/login')} className="btn-primary">立即创作</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

// Hero
function Hero() {
  const navigate = useNavigate()
  const projects = useStore((s) => s.projects)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-950">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-neon-blue/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-neon-blue/5 via-neon-purple/5 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-40 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-glass-white rounded-full border border-glass-border mb-8">
            <span className="w-2 h-2 bg-neon-blue rounded-full animate-pulse" />
            <span className="text-sm text-dark-300">AI驱动 · 智能创作</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
            让每个商家都能
            <br />
            <span className="gradient-text glow-text">讲好自己的品牌故事</span>
          </h1>
          <p className="text-xl md:text-2xl text-dark-300 mb-10 max-w-2xl mx-auto">
            5分钟完成创意策划，10分钟生成专业级广告视频
            <br />
            <span className="text-dark-400">成本降低90%，效果媲美万元级制作</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/create')} className="btn-primary text-lg px-8 py-4">
              <Zap className="w-6 h-6 inline-block mr-2" />
              立即创作
            </button>
            <button className="btn-secondary text-lg px-8 py-4 border-glass-border">
              查看案例
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-24">
          <p className="text-dark-400 mb-6">最新优秀作品</p>
          <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 justify-center">
            {projects.slice(0, 4).map((project, idx) => (
              <div key={project.id} className="flex-shrink-0 w-72 group cursor-pointer">
                <div className="relative rounded-2xl overflow-hidden aspect-video mb-3 border border-glass-border">
                  <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex items-center gap-3 text-white">
                      <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{project.views}</span>
                      <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{project.likes}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-dark-800/80 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-sm border border-glass-border">
                    {project.duration}
                  </div>
                </div>
                <h3 className="text-white font-medium truncate">{project.title}</h3>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 py-8 bg-gradient-to-t from-dark-950 to-transparent">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-8">
          <div className="flex items-center gap-2 text-dark-400">
            <div className="w-10 h-10 bg-neon-blue/10 rounded-full flex items-center justify-center border border-glass-border">
              <Zap className="w-5 h-5 text-neon-blue" />
            </div>
            <span>已生成10万+广告</span>
          </div>
          <div className="flex items-center gap-2 text-dark-400">
            <div className="w-10 h-10 bg-neon-purple/10 rounded-full flex items-center justify-center border border-glass-border">
              <Shield className="w-5 h-5 text-neon-purple" />
            </div>
            <span>即梦AI官方合作</span>
          </div>
          <div className="flex items-center gap-2 text-dark-400">
            <div className="w-10 h-10 bg-neon-pink/10 rounded-full flex items-center justify-center border border-glass-border">
              <Sparkles className="w-5 h-5 text-neon-pink" />
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
    <section className="py-20 bg-dark-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-display font-bold text-white">作品广场</h2>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-xl border border-glass-border hover:border-neon-blue transition-colors">
            <Filter className="w-4 h-4" />
            筛选
            {(filterCategory !== '全部' || filterStyle !== '全部') && <span className="w-2 h-2 bg-neon-blue rounded-full" />}
          </button>
        </div>

        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8 p-6 bg-dark-800/50 rounded-2xl border border-glass-border backdrop-blur-xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-3">行业</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-4 py-2 rounded-xl text-sm transition-colors ${filterCategory === cat ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-3">风格</label>
                <div className="flex flex-wrap gap-2">
                  {styles.map(style => (
                    <button key={style} onClick={() => setFilterStyle(style)} className={`px-4 py-2 rounded-xl text-sm transition-colors ${filterStyle === style ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'}`}>
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
            <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className="card group cursor-pointer">
              <Link to={`/detail/${project.id}`}>
                <div className="relative rounded-2xl overflow-hidden aspect-video mb-4 border border-glass-border">
                  <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <div className="flex items-center gap-3 text-white">
                      <span className="flex items-center gap-1 text-sm"><Eye className="w-4 h-4" />{project.views}</span>
                      <span className="flex items-center gap-1 text-sm"><Heart className="w-4 h-4" />{project.likes}</span>
                    </div>
                    <div className="w-10 h-10 bg-glass-white rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-dark-800/80 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-xs border border-glass-border">
                    {project.duration}
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-2 truncate group-hover:text-neon-blue transition-colors">{project.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={project.author.avatar} alt={project.author.name} className="w-6 h-6 rounded-full border border-glass-border" />
                    <span className="text-sm text-dark-400">{project.author.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-dark-500">
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
    <section className="py-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-display font-bold text-white mb-10">热门模板</h2>
        <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4">
          {templates.map((template, idx) => (
            <motion.div key={template.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className="flex-shrink-0 w-72 group cursor-pointer">
              <div className="relative rounded-2xl overflow-hidden aspect-[3/2] mb-4 border border-glass-border">
                <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full text-white text-xs mb-2">
                    {template.category}
                  </span>
                  <h3 className="text-white font-semibold">{template.name}</h3>
                </div>
                <div className="absolute top-3 right-3 bg-dark-800/80 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-xs border border-glass-border">
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

// Pricing Preview
function PricingPreview() {
  const navigate = useNavigate()

  const plans = [
    { name: '免费版', price: '¥0', period: '', features: ['3次/月', '15秒', '720P', '有水印'], highlight: false },
    { name: '月度会员', price: '¥49', period: '/月', features: ['50次/月', '60秒', '1080P', '去水印', '高速通道', 'AI音效'], highlight: true },
    { name: '年度会员', price: '¥299', period: '/年', features: ['100次+/月', '120秒', '2K', '去水印', '极速通道', '全库音效', '专属客服'], highlight: false }
  ]

  return (
    <section className="py-20 bg-dark-950 relative">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-neon-purple/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon-blue/10 rounded-full blur-[100px]" />
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">简单透明的定价</h2>
          <p className="text-dark-400">选择最适合您的创作套餐</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className={`relative p-6 rounded-2xl backdrop-blur-xl ${plan.highlight ? 'bg-gradient-to-b from-neon-blue/20 to-neon-purple/20 border-2 border-neon-blue/50' : 'bg-dark-800/50 border border-glass-border'}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-neon-blue to-neon-purple text-white text-sm rounded-full">
                  最受欢迎
                </div>
              )}
              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-dark-400">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-dark-300">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-neon-blue/20' : 'bg-dark-700'}`}>
                      <Sparkles className={`w-3 h-3 ${plan.highlight ? 'text-neon-blue' : 'text-dark-400'}`} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/pricing')} className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}>
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
    <footer className="bg-dark-900 py-16 border-t border-glass-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center shadow-neon">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-white">创影</span>
            </Link>
            <p className="text-dark-500 text-sm">AI驱动的故事化广告生成平台</p>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item}><a href="#" className="text-dark-500 hover:text-neon-blue transition-colors text-sm">{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-glass-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-dark-500 text-sm">© 2026 创影科技 All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-dark-500 hover:text-neon-blue transition-colors"><Shield className="w-5 h-5" /></a>
            <a href="#" className="text-dark-500 hover:text-neon-purple transition-colors"><Sparkles className="w-5 h-5" /></a>
            <a href="#" className="text-dark-500 hover:text-neon-pink transition-colors"><Zap className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <Hero />
      <WorksSection />
      <TemplatesSection />
      <PricingPreview />
      <Footer />
    </div>
  )
}
