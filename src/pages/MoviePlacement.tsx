import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Sparkles, Upload, Package, X, ArrowLeft, 
  Clock, Monitor, Smartphone, Wand2, Crown, User, LogOut,
  Clapperboard, Film, Video
} from 'lucide-react'
import { useStore } from '../store'

// Movie type options
const movieTypes = [
  { id: 'action', name: '动作片', icon: '🎬' },
  { id: 'comedy', name: '喜剧片', icon: '😂' },
  { id: 'romance', name: '爱情片', icon: '💕' },
  { id: 'sci-fi', name: '科幻片', icon: '🚀' },
  { id: 'fantasy', name: '奇幻片', icon: '✨' },
  { id: 'drama', name: '剧情片', icon: '🎭' },
  { id: 'horror', name: '恐怖片', icon: '👻' },
  { id: 'animation', name: '动画片', icon: '🎨' },
]

// Duration options
const durations = [
  { value: '15', label: '15秒', desc: '短视频，适合社交媒体' },
  { value: '30', label: '30秒', desc: '标准短视频' },
  { value: '60', label: '60秒', desc: '中等时长' },
  { value: '90', label: '90秒', desc: '较长内容' },
  { value: '120', label: '120秒', desc: '完整故事' },
]

// Aspect ratio options
const aspectRatios = [
  { value: '16:9', label: '16:9', icon: Monitor, desc: '横屏 - 电视/电脑' },
  { value: '9:16', label: '9:16', icon: Smartphone, desc: '竖屏 - 手机短视频' },
  { value: '1:1', label: '1:1', icon: Film, desc: '方形 - 社交媒体' },
  { value: '4:3', label: '4:3', icon: Video, desc: '经典比例' },
]

// Sample movies for each type
const sampleMovies: Record<string, string[]> = {
  action: ['速度与激情', '黑客帝国', '碟中谍', '虎胆龙威', '壮志凌云'],
  comedy: ['周星驰系列', '人在囧途', '疯狂的石头', '夏洛特烦恼', '西虹市首富'],
  romance: ['泰坦尼克号', '罗马假日', '恋恋笔记本', '情书', '爱情公寓'],
  'sci-fi': ['星球大战', '黑客帝国', '盗梦空间', '流浪地球', '阿凡达'],
  fantasy: ['哈利波特', '指环王', '纳尼亚传奇', '捉妖记', '哪吒之魔童降世'],
  drama: ['肖申克的救赎', '阿甘正传', '霸王别姬', '我不是药神', '你好，李焕英'],
  horror: ['招魂', '寂静之地', '生化危机', '山村老尸', '午夜凶铃'],
  animation: ['冰雪奇缘', '千与千寻', '疯狂动物城', '哪吒之魔童降世', '大鱼海棠'],
}

interface ProductInfo {
  name: string
  description: string
  images: string[]
  logo: string
}

export default function MoviePlacement() {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout, setShowLoginModal } = useStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    name: '',
    description: '',
    images: [],
    logo: ''
  })
  const [selectedMovieType, setSelectedMovieType] = useState('')
  const [specificMovie, setSpecificMovie] = useState('')
  const [customMovie, setCustomMovie] = useState('')
  const [duration, setDuration] = useState('30')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [step, setStep] = useState(1)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const newImages = [...productInfo.images]
        newImages[index] = reader.result as string
        setProductInfo({ ...productInfo, images: newImages.slice(0, 3) })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...productInfo.images]
    newImages[index] = ''
    setProductInfo({ ...productInfo, images: newImages })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 500 * 1024) {
        alert('Logo图片大小不能超过500KB')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setProductInfo({ ...productInfo, logo: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    alert('功能开发中...')
  }

  const movies = selectedMovieType ? sampleMovies[selectedMovieType] || [] : []

  return (
    <div className="min-h-screen bg-luxury-950">
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-r from-ambient-blue via-ambient-purple to-ambient-cyan">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold gradient-text tracking-tight">虹忆坊</span>
          </Link>

          <div className="flex items-center gap-1 p-1 bg-luxury-800/50 rounded-xl border border-glass-border">
            <button
              onClick={() => navigate('/create-guide')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-luxury-400 hover:text-white hover:bg-luxury-700"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
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

      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-glass-light rounded-full border border-glass-border mb-4">
              <Clapperboard className="w-3.5 h-3.5 text-ambient-purple" />
              <span className="text-xs text-luxury-300">趣味玩法</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">
              将你的产品植入<span className="gradient-text">任何一部电影</span>
            </h1>
            <p className="text-luxury-400 text-base max-w-xl mx-auto">
              让经典角色为你做广告，打造独特的品牌记忆点
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  step >= s 
                    ? 'bg-gradient-to-r from-ambient-blue to-ambient-purple text-white shadow-soft' 
                    : 'bg-luxury-800/50 text-luxury-400 backdrop-blur-sm border border-glass-border'
                }`}>
                  {step > s ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center text-sm font-medium">{s}</span>
                  )}
                  <span className="hidden sm:inline text-sm font-medium">
                    {s === 1 ? '产品信息' : '电影设定'}
                  </span>
                </div>
                {s < 2 && <span className="text-luxury-500 mx-2">→</span>}
              </div>
            ))}
          </div>

          {step === 1 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="space-y-6"
            >
              <div className="bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-ambient-purple" />
                  产品信息
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-2 block">
                      产品名称
                    </label>
                    <input
                      type="text"
                      value={productInfo.name}
                      onChange={(e) => setProductInfo({ ...productInfo, name: e.target.value })}
                      placeholder="输入产品名称..."
                      className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-2 block">
                      产品Logo <span className="text-luxury-600">(jpg/png, ≤500KB)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-xl bg-luxury-950/50 border-2 border-dashed border-white/10 overflow-hidden relative">
                        {productInfo.logo ? (
                          <>
                            <img src={productInfo.logo} alt="Logo" className="w-full h-full object-cover" />
                            <button
                              onClick={() => setProductInfo({ ...productInfo, logo: '' })}
                              className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-luxury-600" />
                          </div>
                        )}
                      </div>
                      <label className="btn-primary cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {productInfo.logo ? '更换' : '上传Logo'}
                        <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleLogoUpload} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-2 block">
                    产品描述
                  </label>
                  <textarea
                    value={productInfo.description}
                    onChange={(e) => setProductInfo({ ...productInfo, description: e.target.value })}
                    placeholder="输入产品特点、卖点..."
                    className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all resize-none h-24"
                  />
                </div>

                <div className="mt-6">
                  <label className="text-xs font-medium text-luxury-400 uppercase tracking-wider mb-2 block">
                    产品图片 <span className="text-luxury-600">(jpg/png, ≤2M, 最多3张)</span>
                  </label>
                  <div className="flex gap-3">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="w-24 h-24 rounded-xl bg-luxury-950/50 border-2 border-dashed border-white/10 overflow-hidden relative">
                        {productInfo.images[idx] && productInfo.images[idx] !== '' ? (
                          <>
                            <img src={productInfo.images[idx]} alt={`产品${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeImage(idx)}
                              className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex items-center justify-center cursor-pointer">
                            <Upload className="w-6 h-6 text-luxury-600" />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, idx)}
                            />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!productInfo.name || !productInfo.description}
                  className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一步
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="space-y-6"
            >
              <div className="bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Film className="w-5 h-5 text-ambient-purple" />
                  选择电影类型
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {movieTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedMovieType(type.id)}
                      className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                        selectedMovieType === type.id
                          ? 'bg-ambient-purple/20 border-ambient-purple text-white'
                          : 'bg-luxury-950/50 border-white/10 text-luxury-400 hover:border-purple-400/50'
                      }`}
                    >
                      <span className="text-xl">{type.icon}</span>
                      <span className="text-xs">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedMovieType && (
                <div className="bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Clapperboard className="w-5 h-5 text-ambient-purple" />
                    选择具体电影
                  </h3>
                  
                  <div className="mb-4">
                    <p className="text-sm text-luxury-400 mb-3">热门推荐</p>
                    <div className="flex flex-wrap gap-2">
                      {movies.map((movie) => (
                        <button
                          key={movie}
                          onClick={() => { setSpecificMovie(movie); setCustomMovie('') }}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            specificMovie === movie
                              ? 'bg-ambient-purple text-white'
                              : 'bg-luxury-950/50 border border-white/10 text-luxury-300 hover:border-purple-400/50'
                          }`}
                        >
                          {movie}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-luxury-400 mb-3">或自定义电影</p>
                    <input
                      type="text"
                      value={customMovie}
                      onChange={(e) => { setCustomMovie(e.target.value); setSpecificMovie('') }}
                      placeholder="输入你想要植入的电影名称..."
                      className="w-full bg-luxury-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-luxury-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-ambient-purple" />
                  时长
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {durations.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={`p-4 rounded-xl border transition-all ${
                        duration === d.value
                          ? 'bg-ambient-purple/20 border-ambient-purple text-white'
                          : 'bg-luxury-950/50 border-white/10 text-luxury-300 hover:border-purple-400/50'
                      }`}
                    >
                      <div className="font-medium">{d.label}</div>
                      <div className="text-xs text-luxury-500 mt-1">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-b from-luxury-800/80 to-luxury-900/80 rounded-2xl p-6 border border-white/5">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-ambient-purple" />
                  画幅比例
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {aspectRatios.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        aspectRatio === ratio.value
                          ? 'bg-ambient-purple/20 border-ambient-purple text-white'
                          : 'bg-luxury-950/50 border-white/10 text-luxury-300 hover:border-purple-400/50'
                      }`}
                    >
                      <ratio.icon className="w-6 h-6" />
                      <div className="font-medium">{ratio.label}</div>
                      <div className="text-xs text-luxury-500">{ratio.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary px-8 py-3"
                >
                  上一步
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedMovieType || (!specificMovie && !customMovie)}
                  className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wand2 className="w-4 h-4" />
                  开始生成
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
