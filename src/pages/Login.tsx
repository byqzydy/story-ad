import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Phone, Video, Zap, Gift, ArrowRight, Check, Sparkles } from 'lucide-react'
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
    <div className="min-h-screen bg-luxury-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-ambient-gradient" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-ambient-blue/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-ambient-purple/5 rounded-full blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-ambient-blue via-ambient-purple to-ambient-cyan">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold gradient-text">虹忆坊</h1>
          <p className="text-luxury-400 text-sm mt-1">最会讲故事的广告AGENT</p>
        </div>

        <div className="bg-luxury-800/60 backdrop-blur-md rounded-2xl border border-glass-border p-6">
          <div className="flex gap-1 p-1 bg-luxury-900 rounded-xl mb-4">
            {[
              { id: 'wechat', icon: MessageCircle, label: '微信', color: 'text-green-400' },
              { id: 'phone', icon: Phone, label: '手机', color: 'text-ambient-blue' },
              { id: 'douyin', icon: Video, label: '抖音', color: 'text-white' }
            ].map(method => (
              <button key={method.id} onClick={() => setLoginMethod(method.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-all ${loginMethod === method.id ? 'bg-luxury-700 text-white' : 'text-luxury-400 hover:text-luxury-200'}`}>
                <method.icon className="w-3.5 h-3.5" />
                <span>{method.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {loginMethod === 'wechat' && (
              <div className="text-center py-4">
                <div className="w-36 h-36 mx-auto bg-luxury-900 rounded-xl flex items-center justify-center mb-3 border border-glass-border">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-green-400 mx-auto mb-1" />
                    <p className="text-luxury-500 text-xs">扫码登录</p>
                  </div>
                </div>
                <p className="text-luxury-500 text-xs mb-4">使用微信扫码即可快速登录</p>
                <button onClick={handleLogin} className="w-full btn-primary text-sm py-2">模拟微信登录</button>
              </div>
            )}

            {loginMethod === 'phone' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-luxury-400 mb-1.5">手机号</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-luxury-400 mb-1.5">验证码</label>
                  <div className="flex gap-2">
                    <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="验证码" className="input-field text-sm flex-1" />
                    <button className="px-3 py-2 bg-luxury-700 text-luxury-300 rounded-xl text-xs hover:bg-luxury-600 transition-colors border border-glass-border">获取</button>
                  </div>
                </div>
                <button onClick={handleLogin} className="w-full btn-primary text-sm py-2 mt-2">登录</button>
              </>
            )}

            {loginMethod === 'douyin' && (
              <div className="text-center py-4">
                <div className="w-14 h-14 mx-auto bg-black rounded-xl flex items-center justify-center mb-3 border border-glass-border">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <p className="text-luxury-500 text-xs mb-4">授权抖音账号，快速发布广告</p>
                <button onClick={handleLogin} className="w-full btn-primary text-sm py-2">模拟抖音登录</button>
              </div>
            )}
          </div>

          <p className="text-center text-luxury-500 text-xs mt-4">
            登录即表示同意<a href="#" className="text-ambient-blue">《用户协议》</a>和<a href="#" className="text-ambient-blue">《隐私政策》</a>
          </p>
        </div>

        <div className="text-center mt-4">
          <button onClick={() => navigate('/')} className="text-luxury-500 hover:text-white text-xs transition-colors">← 返回首页</button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showGuide && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-950/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-luxury-800 rounded-2xl border border-glass-border p-5 max-w-sm w-full">
              <button onClick={() => setShowGuide(false)} className="absolute top-3 right-3 p-1.5 hover:bg-luxury-700 rounded-lg transition-colors">
                <X className="w-4 h-4 text-luxury-400" />
              </button>

              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-ambient-purple to-ambient-pink rounded-xl mb-3">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-white">欢迎来到虹忆坊！</h2>
                <p className="text-luxury-400 text-sm mt-0.5">新用户专享见面礼</p>
              </div>

              <div className="bg-gradient-to-r from-ambient-blue via-ambient-purple to-ambient-cyan rounded-xl p-4 mb-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-sm">免费生成次数</span>
                  <span className="text-2xl font-semibold">3次</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">有效期限</span>
                  <span className="font-medium">永久有效</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {['AI智能创作', '专业级广告视频', '多种模板选择'].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-luxury-300 text-sm">
                    <div className="w-4 h-4 bg-ambient-blue/20 rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-ambient-blue" /></div>
                    {feature}
                  </div>
                ))}
              </div>

              <button onClick={() => { setShowGuide(false); handleLogin() }} className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-1.5">
                立即领取 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
