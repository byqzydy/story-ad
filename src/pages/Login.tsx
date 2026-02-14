import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Phone, Video, Zap, Gift, ArrowRight, Check } from 'lucide-react'
import { useStore } from '../store'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useStore()
  const [showGuide, setShowGuide] = useState(true)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loginMethod, setLoginMethod] = useState<'wechat' | 'phone' | 'douyin'>('wechat')

  const handleLogin = () => {
    login({
      id: '1', name: '用户', avatar: 'https://i.pravatar.cc/100?img=1',
      level: 'bronze', totalGenerations: 0, totalLikes: 0, totalViews: 0
    })
    navigate('/create')
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[400px] h-[400px] bg-neon-blue/10 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-1/4 w-[400px] h-[400px] bg-neon-purple/10 rounded-full blur-[100px] animate-pulse-slow" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink rounded-2xl mb-4 shadow-neon">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold gradient-text">创影</h1>
          <p className="text-dark-400 mt-2">让每个商家都能讲好自己的品牌故事</p>
        </div>

        <div className="bg-dark-800/80 backdrop-blur-xl rounded-3xl shadow-card-dark border border-glass-border p-8">
          <div className="flex gap-2 p-1 bg-dark-900 rounded-xl mb-6">
            {[
              { id: 'wechat', icon: MessageCircle, label: '微信登录', color: 'text-green-400' },
              { id: 'phone', icon: Phone, label: '手机登录', color: 'text-neon-blue' },
              { id: 'douyin', icon: Video, label: '抖音登录', color: 'text-white' }
            ].map(method => (
              <button key={method.id} onClick={() => setLoginMethod(method.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${loginMethod === method.id ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' : 'text-dark-400 hover:text-white'}`}>
                <method.icon className={`w-5 h-5 ${loginMethod === method.id ? '' : method.color}`} />
                <span className="hidden sm:inline text-sm">{method.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {loginMethod === 'wechat' && (
              <div className="text-center py-8">
                <div className="w-48 h-48 mx-auto bg-dark-900 rounded-2xl flex items-center justify-center mb-4 border border-glass-border">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-green-400 mx-auto mb-2" />
                    <p className="text-dark-400 text-sm">扫码登录</p>
                  </div>
                </div>
                <p className="text-dark-500 text-sm mb-6">使用微信扫码即可快速登录</p>
                <button onClick={handleLogin} className="w-full btn-primary">模拟微信登录</button>
              </div>
            )}

            {loginMethod === 'phone' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">手机号</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">验证码</label>
                  <div className="flex gap-2">
                    <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="请输入验证码" className="input-field flex-1" />
                    <button className="px-4 py-3 bg-dark-700 text-dark-300 rounded-xl hover:bg-dark-600 transition-colors border border-glass-border">获取验证码</button>
                  </div>
                </div>
                <button onClick={handleLogin} className="w-full btn-primary mt-6">登录</button>
              </>
            )}

            {loginMethod === 'douyin' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-black rounded-2xl flex items-center justify-center mb-4 border border-glass-border">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <p className="text-dark-500 text-sm mb-6">授权抖音账号，快速发布广告</p>
                <button onClick={handleLogin} className="w-full btn-primary">模拟抖音登录</button>
              </div>
            )}
          </div>

          <p className="text-center text-dark-500 text-sm mt-6">
            登录即表示同意
            <a href="#" className="text-neon-blue">《用户协议》</a>
            和
            <a href="#" className="text-neon-blue">《隐私政策》</a>
          </p>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => navigate('/')} className="text-dark-400 hover:text-white transition-colors">← 返回首页</button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showGuide && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-dark-800 rounded-3xl shadow-card-dark border border-glass-border p-8 max-w-md w-full">
              <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 p-2 hover:bg-dark-700 rounded-xl transition-colors">
                <X className="w-5 h-5 text-dark-400" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-neon-purple to-neon-pink rounded-2xl mb-4 shadow-neon">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white">欢迎来到创影！</h2>
                <p className="text-dark-400 mt-2">新用户专享见面礼</p>
              </div>

              <div className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink rounded-2xl p-6 mb-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/80">免费生成次数</span>
                  <span className="text-3xl font-bold">3次</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">有效期限</span>
                  <span className="font-semibold">永久有效</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {['AI智能创作', '专业级广告视频', '多种模板选择'].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-dark-300">
                    <div className="w-5 h-5 bg-neon-blue/20 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-neon-blue" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              <button onClick={() => { setShowGuide(false); handleLogin() }} className="w-full btn-primary flex items-center justify-center gap-2">
                立即领取 <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
