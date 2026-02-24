import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Heart, Eye, Star, Zap, Shield, Sparkles, ChevronDown, Filter, User, LogOut } from 'lucide-react'
import { useStore } from '../store'
import LoginModal from '../components/LoginModal'

// Navbar - Minimal Glassmorphism
function Navbar() {
  const navigate = useNavigate()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-r from-ambient-blue via-ambient-purple to-ambient-cyan">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold gradient-text tracking-tight">虹忆坊</span>
        </Link>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/create-guide')} className="btn-primary text-sm">开始创作</button>
        </div>
      </div>
    </nav>
  )
}

// Default sample projects when no real projects exist
const SAMPLE_PROJECTS = [
  { id: 's1', title: '未来科技感广告', thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=711&fit=crop', views: 12500, likes: 3200, duration: '30s' },
  { id: 's2', title: '温暖治愈系', thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=711&fit=crop', views: 8900, likes: 2100, duration: '60s' },
  { id: 's3', title: '炫酷运动风', thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=711&fit=crop', views: 15600, likes: 4500, duration: '15s' },
  { id: 's4', title: '唯美爱情故事', thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=711&fit=crop', views: 22300, likes: 6700, duration: '60s' },
  { id: 's5', title: '科幻大片质感', thumbnail: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=711&fit=crop', views: 31200, likes: 8900, duration: '90s' },
  { id: 's6', title: '简约生活方式', thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=711&fit=crop', views: 7800, likes: 1800, duration: '30s' },
  { id: 's7', title: '复古情怀', thumbnail: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=400&h=711&fit=crop', views: 11200, likes: 2900, duration: '45s' },
  { id: 's8', title: '自然风光', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=711&fit=crop', views: 19800, likes: 5200, duration: '30s' },
  { id: 's9', title: '都市快节奏', thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=711&fit=crop', views: 14500, likes: 3800, duration: '15s' },
  { id: 's10', title: '梦幻童话', thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=711&fit=crop', views: 26700, likes: 7200, duration: '60s' },
]

// Hero Section
function Hero() {
  const navigate = useNavigate()
  const projects = useStore((s) => s.projects)
  const { isLoggedIn, setShowLoginModal, setShowWelcomeGiftAfterLogin } = useStore()
  const [topProjects, setTopProjects] = useState<typeof projects>([])

  // Get top 10 most liked published projects, or use samples if none exist
  useEffect(() => {
    const updateTopProjects = () => {
      const publishedProjects = projects.filter(p => p.status === 'published')
      const sorted = [...publishedProjects].sort((a, b) => b.likes - a.likes).slice(0, 10)
      // Use sample projects if no real projects
      setTopProjects(sorted.length > 0 ? sorted : SAMPLE_PROJECTS as any)
    }

    updateTopProjects()
    
    // Update every 2 hours
    const interval = setInterval(updateTopProjects, 2 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [projects])

  const handleCreateClick = () => {
    if (!isLoggedIn) {
      setShowWelcomeGiftAfterLogin(true)
      setShowLoginModal(true)
    } else {
      navigate('/create-guide')
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-luxury-950">
      <div className="absolute inset-0 bg-ambient-gradient" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-ambient-blue/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-ambient-purple/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-8 py-40 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-glass-light rounded-full border border-glass-border mb-6">
            <span className="w-1.5 h-1.5 bg-ambient-blue rounded-full" />
            <span className="text-xs text-luxury-300">AI驱动 · 智能创作</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-semibold text-white mb-5 tracking-tight leading-[1.3]">
            <span className="block mb-4">用AI讲述你的品牌故事</span>
            <span className="gradient-text block">最会讲故事的广告Agent</span>
          </h1>
          <p className="text-lg text-luxury-300 mt-10 mb-8 max-w-xl mx-auto">
            5分钟完成创意策划，10分钟生成专业级广告视频
            <br />
            <span className="text-luxury-400 text-sm">成本降低90%，效果媲美万元级制作</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={handleCreateClick} className="btn-primary text-sm px-6 py-2.5">
              <Zap className="w-4 h-4 inline-block mr-1.5" />立即创作
            </button>
            <button onClick={() => document.getElementById('works-section')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary text-sm px-6 py-2.5">查看案例</button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-16">
          <p className="text-xs text-luxury-400 uppercase tracking-wider mb-4 px-4">热门精选作品</p>
          <div className="relative overflow-hidden -mx-8">
            <div 
              className="flex gap-4 px-8"
              style={{
                animation: 'scroll-right-to-left 60s linear infinite',
                width: 'max-content'
              }}
            >
              {/* Triple the projects for seamless loop */}
              {[...topProjects, ...topProjects, ...topProjects].map((project, idx) => (
                <Link key={`${project.id}-${idx}`} to={`/detail/${project.id}`} className="flex-shrink-0 w-40 md:w-48 group cursor-pointer">
                  <div className="relative rounded-xl overflow-hidden aspect-[9/16] mb-3 border border-glass-border">
                    <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div className="flex items-center gap-3 text-white text-xs">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{project.views}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{project.likes}</span>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-luxury-950/60 backdrop-blur-sm rounded text-white text-xs">
                      {project.duration}
                    </div>
                  </div>
                  <h3 className="text-sm text-luxury-100 truncate">{project.title}</h3>
                </Link>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes scroll-right-to-left {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
          `}</style>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 py-6 bg-gradient-to-t from-luxury-950 to-transparent">
        <div className="max-w-3xl mx-auto px-8 flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2 text-luxury-400 text-sm">
            <div className="w-8 h-8 bg-ambient-blue/10 rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-ambient-blue" /></div>
            <span>已生成10万+广告</span>
          </div>
          <div className="flex items-center gap-2 text-luxury-400 text-sm">
            <div className="w-8 h-8 bg-ambient-purple/10 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-ambient-purple" /></div>
            <span>即梦AI官方合作</span>
          </div>
          <div className="flex items-center gap-2 text-luxury-400 text-sm">
            <div className="w-8 h-8 bg-ambient-cyan/10 rounded-lg flex items-center justify-center"><Sparkles className="w-4 h-4 text-ambient-cyan" /></div>
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
  const styles = ['全部', '温馨', '搞笑', '励志', '清爽', '科技']

  const filteredProjects = projects.filter(p => {
    if (filterCategory !== '全部' && p.category !== filterCategory) return false
    if (filterStyle !== '全部' && p.style !== filterStyle) return false
    return true
  })

  return (
    <section className="py-16 bg-luxury-950">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-white">作品广场</h2>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-3 py-1.5 bg-luxury-800 rounded-xl border border-glass-border hover:border-ambient-blue/30 transition-colors text-sm text-luxury-300">
            <Filter className="w-4 h-4" />筛选
          </button>
        </div>

        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 bg-luxury-800/50 rounded-xl border border-glass-border">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-luxury-400 mb-2 uppercase tracking-wider">行业</label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filterCategory === cat ? 'bg-primary text-white' : 'bg-luxury-700 text-luxury-300 hover:bg-luxury-600'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-luxury-400 mb-2 uppercase tracking-wider">风格</label>
                <div className="flex flex-wrap gap-1.5">
                  {styles.map(style => (
                    <button key={style} onClick={() => setFilterStyle(style)} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filterStyle === style ? 'bg-primary text-white' : 'bg-luxury-700 text-luxury-300 hover:bg-luxury-600'}`}>
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProjects.map((project, idx) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.03 }} className="card group cursor-pointer">
              <Link to={`/detail/${project.id}`}>
                <div className="relative rounded-xl overflow-hidden aspect-[9/16] mb-3 border border-glass-border">
                  <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-luxury-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                    <div className="flex items-center gap-2 text-white text-xs">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{project.views}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{project.likes}</span>
                    </div>
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"><Play className="w-4 h-4 text-white ml-0.5" /></div>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-luxury-950/60 backdrop-blur-sm rounded text-white text-xs">{project.duration}</div>
                </div>
                <h3 className="font-medium text-luxury-100 text-sm truncate mb-2">{project.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <img src={project.author.avatar} alt={project.author.name} className="w-5 h-5 rounded" />
                    <span className="text-xs text-luxury-400">{project.author.name}</span>
                  </div>
                  <span className="text-xs text-luxury-500">{project.category}</span>
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
    <section className="py-16 bg-luxury-900">
      <div className="max-w-6xl mx-auto px-8">
        <h2 className="text-2xl font-semibold text-white mb-6">热门模板</h2>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {templates.map((template, idx) => (
            <motion.div key={template.id} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.03 }} className="flex-shrink-0 w-56 group cursor-pointer">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-3 border border-glass-border">
                <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-950/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block px-2 py-0.5 bg-primary/80 rounded text-white text-xs">{template.category}</span>
                  <h3 className="text-white font-medium text-sm mt-1">{template.name}</h3>
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-luxury-950/60 backdrop-blur-sm rounded text-white text-xs">{template.usageCount.toLocaleString()}次</div>
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
    { name: '免费版', price: '¥0', features: ['3次/月', '15秒', '720P', '有水印'] },
    { name: '月度会员', price: '¥49', features: ['50次/月', '60秒', '1080P', '去水印', '高速通道'], highlight: true },
    { name: '年度会员', price: '¥299', features: ['100次+/月', '120秒', '2K', '极速通道', '专属客服'] }
  ]

  return (
    <section className="py-16 bg-luxury-950 relative">
      <div className="absolute inset-0 bg-ambient-gradient opacity-50" />
      <div className="relative max-w-5xl mx-auto px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">简单透明的定价</h2>
          <p className="text-luxury-400">选择最适合您的创作套餐</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, idx) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className={`relative p-5 rounded-2xl ${plan.highlight ? 'bg-luxury-800/80 border-2 border-primary/50' : 'bg-luxury-800/50 border border-glass-border'}`}>
              {plan.highlight && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-white text-xs rounded-full">最受欢迎</div>}
              <h3 className="text-lg font-medium text-white mb-1">{plan.name}</h3>
              <div className="mb-4"><span className="text-3xl font-semibold text-white">{plan.price}</span></div>
              <ul className="space-y-2 mb-5">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-luxury-300">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-primary/20' : 'bg-luxury-700'}`}>
                      <Sparkles className={`w-2 h-2 ${plan.highlight ? 'text-primary' : 'text-luxury-500'}`} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/pricing')} className={`w-full py-2 rounded-xl text-sm font-medium transition-all ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}>查看详情</button>
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
    <footer className="bg-luxury-900 py-12 border-t border-glass-border/50">
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-r from-ambient-blue via-ambient-purple to-ambient-cyan">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold gradient-text">虹忆坊</span>
            </Link>
            <p className="text-xs text-luxury-500">AI驱动的故事化广告生成平台</p>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-sm font-medium text-luxury-200 mb-2">{title}</h4>
              <ul className="space-y-1.5">
                {items.map(item => <li key={item}><a href="#" className="text-xs text-luxury-500 hover:text-ambient-blue transition-colors">{item}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-glass-border/30 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-luxury-500">© 2026 虹忆坊科技 All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-luxury-500 hover:text-ambient-blue transition-colors"><Shield className="w-4 h-4" /></a>
            <a href="#" className="text-luxury-500 hover:text-ambient-purple transition-colors"><Sparkles className="w-4 h-4" /></a>
            <a href="#" className="text-luxury-500 hover:text-ambient-cyan transition-colors"><Zap className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-luxury-950">
      <Navbar />
      <Hero />
      <div id="works-section">
        <WorksSection />
      </div>
      <TemplatesSection />
      <PricingPreview />
      <Footer />
      <LoginModal />
    </div>
  )
}
