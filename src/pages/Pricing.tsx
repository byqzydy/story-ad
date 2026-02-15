import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Check, X, Zap, Shield, Star, Clock, Download, Video,
  Music, Headphones, MessageCircle, Sparkles, Crown, ArrowLeft
} from 'lucide-react'

export default function Pricing() {
  const navigate = useNavigate()

  const plans = [
    {
      name: '免费版',
      price: '¥0',
      period: '永久免费',
      description: '适合体验尝试',
      features: [
        { name: '生成次数', value: '3次/月' },
        { name: '视频时长', value: '15秒' },
        { name: '分辨率', value: '720P' },
        { name: '水印', value: '有', included: false },
        { name: '商用授权', value: '无', included: false },
        { name: '生成速度', value: '标准队列' },
        { name: 'AI音效', value: '基础库' },
        { name: '专属客服', value: '无', included: false },
      ],
      highlight: false,
      cta: '当前套餐'
    },
    {
      name: '月度会员',
      price: '¥49',
      period: '/月',
      description: '适合个人创作者',
      features: [
        { name: '生成次数', value: '50次/月' },
        { name: '视频时长', value: '60秒' },
        { name: '分辨率', value: '1080P' },
        { name: '水印', value: '可去除', included: true },
        { name: '商用授权', value: '个人商用', included: true },
        { name: '生成速度', value: '优先队列' },
        { name: 'AI音效', value: '全库+AI生成', included: true },
        { name: '专属客服', value: '无', included: false },
      ],
      highlight: true,
      cta: '立即开通'
    },
    {
      name: '年度会员',
      price: '¥299',
      period: '/年',
      description: '适合专业创作者',
      originalPrice: '¥588',
      features: [
        { name: '生成次数', value: '100次+/月' },
        { name: '视频时长', value: '120秒' },
        { name: '分辨率', value: '2K' },
        { name: '水印', value: '可去除', included: true },
        { name: '商用授权', value: '企业商用', included: true },
        { name: '生成速度', value: '极速通道', included: true },
        { name: 'AI音效', value: '全库+AI生成', included: true },
        { name: '专属客服', value: '1v1专属', included: true },
      ],
      highlight: false,
      popular: true,
      cta: '最划算'
    }
  ]

  const addOnServices = [
    {
      name: '额外生成包',
      price: '¥19.9',
      description: '10次生成次数',
      icon: Zap
    },
    {
      name: '高清修复',
      price: '¥9.9',
      description: '升级历史作品至2K',
      icon: Video
    },
    {
      name: '专属角色训练',
      price: '¥99',
      description: '固定IP形象一致性',
      icon: Star
    },
    {
      name: '人工精修',
      price: '¥199',
      description: 'AI生成后人工优化',
      icon: Sparkles
    }
  ]

  return (
    <div className="min-h-screen bg-luxury-950">
      <div className="absolute inset-0 bg-ambient-gradient opacity-20" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-ambient-blue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-ambient-purple/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/create-guide')}
              className="p-2 hover:bg-glass-light rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-luxury-300" />
            </button>
            <h1 className="text-xl font-semibold text-white">会员套餐</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Main Plans */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            选择您的创作套餐
          </h2>
          <p className="text-luxury-400 text-lg">
            灵活的定价方案，满足不同创作需求
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative card overflow-hidden ${
                plan.highlight ? 'border-ambient-blue shadow-glow' : 'border-glass-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-ambient-blue to-ambient-purple text-white text-center py-2 text-sm font-medium">
                  👑 最受欢迎
                </div>
              )}
              
              <div className={`p-6 ${plan.popular ? 'pt-12' : ''}`}>
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-luxury-400 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  {plan.originalPrice && (
                    <span className="text-luxury-500 line-through text-lg mr-2">
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                  <span className="text-luxury-400">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-luxury-400">{feature.name}</span>
                      <span className={`font-medium ${
                        feature.included === true 
                          ? 'text-green-400' 
                          : feature.included === false 
                            ? 'text-red-400' 
                            : 'text-luxury-100'
                      }`}>
                        {feature.included === true && <Check className="w-4 h-4 inline mr-1" />}
                        {feature.included === false && <X className="w-4 h-4 inline mr-1" />}
                        {feature.value}
                      </span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.highlight
                      ? 'btn-primary'
                      : 'card border-glass-border text-luxury-300 hover:border-ambient-blue/50'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add-on Services */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold text-white text-center mb-8">
            增值服务
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {addOnServices.map((service, idx) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card border-glass-border p-6 hover:border-ambient-purple/50 hover:shadow-glow transition-all flex items-center gap-4 cursor-pointer"
              >
                <div className="w-14 h-14 bg-ambient-blue/20 rounded-2xl flex items-center justify-center border border-ambient-blue/30">
                  <service.icon className="w-7 h-7 text-ambient-blue" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{service.name}</h4>
                  <p className="text-luxury-400 text-sm">{service.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-ambient-purple">{service.price}</p>
                  <button className="text-sm text-ambient-purple hover:underline">
                    购买
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h3 className="text-2xl font-semibold text-white text-center mb-8">
            常见问题
          </h3>
          <div className="space-y-4">
            {[
              {
                q: '生成次数用完怎么办？',
                a: '可以购买额外生成包，或等待下个月自动刷新生成次数。'
              },
              {
                q: '免费版可以商用吗？',
                a: '免费版生成的作品仅限个人学习欣赏，不可商用。商用需开通会员。'
              },
              {
                q: '如何取消订阅？',
                a: '可在个人中心-会员管理中取消订阅，取消后仍可使用至会员到期。'
              },
              {
                q: '生成视频可以下载什么格式？',
                a: '支持下载MP4(H.264)、GIF、WebM格式，满足不同使用场景。'
              }
            ].map((faq, idx) => (
              <div key={idx} className="card border-glass-border p-6">
                <h4 className="font-semibold text-white mb-2">{faq.q}</h4>
                <p className="text-luxury-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
