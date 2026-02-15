import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, User, Settings, LogOut, Play, Heart, Star, Eye,
  Grid, List, Download, Trash2, MoreHorizontal, Video, FolderOpen, ChevronRight, AlertTriangle, X, Camera, Check
} from 'lucide-react'
import { useStore } from '../store'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, projects, updateUser } = useStore()
  const [activeMenu, setActiveMenu] = useState<'profile' | 'works' | 'assets' | 'favorites' | 'settings'>('works')
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // 个人资料编辑状态
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    avatar: '',
    gender: '',
    age: '',
    bio: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 当 user 数据变化时，更新 editForm
  useEffect(() => {
    setEditForm({
      name: user?.name || '',
      avatar: user?.avatar || '',
      gender: user?.gender || '',
      age: user?.age?.toString() || '',
      bio: user?.bio || ''
    })
  }, [user])

  const levelInfo = {
    bronze: { name: '青铜创作者', progress: 20, next: '白银', need: 80 },
    silver: { name: '白银创作者', progress: 40, next: '黄金', need: 60 },
    gold: { name: '黄金创作者', progress: 60, next: '铂金', need: 40 },
    platinum: { name: '铂金创作者', progress: 80, next: '钻石', need: 20 },
    diamond: { name: '钻石创作者', progress: 100, next: '', need: 0 }
  }

  const currentLevel = user ? levelInfo[user.level] : levelInfo.bronze

  // 检查单个字段是否可以更改（每月一次）
  const canEditField = (field: string) => {
    const lastUpdateKey = `last${field.charAt(0).toUpperCase()}${field.slice(1)}Update` as keyof typeof user
    const lastUpdate = user?.[lastUpdateKey] as string | undefined
    if (!lastUpdate) return true  // 从未更改过，可以更改
    const lastDate = new Date(lastUpdate)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 30
  }

  // 检查字段值是否真的改变了
  const hasFieldChanged = (field: string, newValue: string) => {
    switch (field) {
      case 'name':
        return newValue !== user?.name
      case 'avatar':
        return newValue !== user?.avatar
      case 'gender':
        return newValue !== (user?.gender || '')
      case 'age':
        return newValue !== (user?.age?.toString() || '')
      case 'bio':
        return newValue !== (user?.bio || '')
      default:
        return false
    }
  }

  // 获取单个字段下次可更改日期
  const getNextEditDateForField = (field: string) => {
    const lastUpdateKey = `last${field.charAt(0).toUpperCase()}${field.slice(1)}Update` as keyof typeof user
    const lastUpdate = user?.[lastUpdateKey] as string | undefined
    if (!lastUpdate) return null
    const lastDate = new Date(lastUpdate)
    const nextDate = new Date(lastDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    return nextDate.toLocaleDateString('zh-CN')
  }

  // 处理头像上传
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, avatar: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  // 保存资料 - 只保存实际更改且未锁定的字段
  const handleSaveProfile = () => {
    const updatedFields: string[] = []
    const updates: Record<string, any> = {}
    
    // 检查每个字段是否改变且未锁定
    if (hasFieldChanged('name', editForm.name) && canEditField('name')) {
      updates.name = editForm.name
      updatedFields.push('name')
    }
    if (hasFieldChanged('avatar', editForm.avatar) && canEditField('avatar')) {
      updates.avatar = editForm.avatar
      updatedFields.push('avatar')
    }
    if (hasFieldChanged('gender', editForm.gender) && canEditField('gender')) {
      updates.gender = editForm.gender as 'male' | 'female' | 'other' | undefined
      updatedFields.push('gender')
    }
    if (hasFieldChanged('age', editForm.age) && canEditField('age')) {
      updates.age = editForm.age ? Number(editForm.age) : undefined
      updatedFields.push('age')
    }
    if (hasFieldChanged('bio', editForm.bio) && canEditField('bio')) {
      updates.bio = editForm.bio
      updatedFields.push('bio')
    }
    
    if (updatedFields.length > 0) {
      updateUser(updates, updatedFields)
    }
    setIsEditing(false)
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditForm({
      name: user?.name || '',
      avatar: user?.avatar || '',
      gender: user?.gender || '',
      age: user?.age?.toString() || '',
      bio: user?.bio || ''
    })
    setIsEditing(false)
  }

  const filteredProjects = projects.filter(p => {
    if (activeMenu === 'favorites') return true // 收藏页面显示所有作品
    if (activeTab === 'published') return p.status === 'published'
    if (activeTab === 'drafts') return p.status === 'draft'
    return true
  })

  return (
    <div className="min-h-screen bg-luxury-950">
      {/* Header */}
      <header className="glass">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-1.5 hover:bg-glass-light rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4 text-luxury-300" />
            </button>
            <h1 className="text-lg font-semibold text-white">个人中心</h1>
          </div>
          <button onClick={() => { logout(); navigate('/create-guide') }} className="flex items-center gap-2 text-luxury-400 hover:text-red-400 transition-colors text-sm">
            <LogOut className="w-4 h-4" />退出登录
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* User Card */}
            <div className="card p-5">
              <div className="text-center">
                <img src={user?.avatar || 'https://i.pravatar.cc/100'} alt="avatar" className="w-16 h-16 rounded-xl mx-auto mb-3" />
                <h2 className="text-base font-medium text-white">{user?.name || '用户'}</h2>
                <p className="text-xs text-luxury-400">{currentLevel.name}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-luxury-500 mb-1">
                    <span>等级经验</span>
                    {currentLevel.need > 0 && <span>距{currentLevel.next} {currentLevel.need}</span>}
                  </div>
                  <div className="h-1.5 bg-luxury-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-ambient-blue to-ambient-purple rounded-full" style={{ width: `${currentLevel.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="card p-4">
              <h3 className="text-sm font-medium text-white mb-3">创作统计</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-luxury-400 flex items-center gap-1.5"><Video className="w-3.5 h-3.5" />累计生成</span>
                  <span className="text-sm font-medium text-white">{user?.totalGenerations || 0} 次</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-luxury-400 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" />获赞总数</span>
                  <span className="text-sm font-medium text-white">{user?.totalLikes || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-luxury-400 flex items-center gap-1.5"><Play className="w-3.5 h-3.5" />总播放量</span>
                  <span className="text-sm font-medium text-white">{user?.totalViews || 0}</span>
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="card overflow-hidden">
              {[
                { icon: User, label: '个人资料', key: 'profile' as const },
                { icon: Video, label: '我的作品', key: 'works' as const },
                { icon: FolderOpen, label: '资产管理', key: 'assets' as const },
                { icon: Star, label: '我的收藏', key: 'favorites' as const },
                { icon: Settings, label: '账号设置', key: 'settings' as const },
              ].map((item) => (
                <button key={item.key} onClick={() => setActiveMenu(item.key)} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-sm ${activeMenu === item.key ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-luxury-300 hover:bg-glass-light'}`}>
                  <item.icon className="w-4 h-4" /><span className="font-medium">{item.label}</span><ChevronRight className="w-3.5 h-3.5 ml-auto text-luxury-500" />
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* 我的作品页面 */}
            {activeMenu === 'works' && (
              <>
                {/* Tabs */}
                <div className="card p-1.5 flex items-center justify-between">
                  <div className="flex gap-1">
                    {[
                      { id: 'published', label: '已发布', icon: Play },
                      { id: 'drafts', label: '草稿箱', icon: Video },
                    ].map(tab => (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${activeTab === tab.id ? 'bg-primary text-white' : 'text-luxury-400 hover:text-white hover:bg-glass-light'}`}>
                        <tab.icon className="w-3.5 h-3.5" />{tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-luxury-500'}`}>
                      <Grid className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-luxury-500'}`}>
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Projects Grid */}
                {viewMode === 'grid' ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project, idx) => (
                      <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="card group cursor-pointer overflow-hidden">
                        <Link to={`/detail/${project.id}`}>
                          <div className="relative aspect-video border-b border-glass-border">
                            <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-luxury-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                              <div className="flex items-center gap-2 text-white text-xs">
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{project.views}</span>
                                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{project.likes}</span>
                              </div>
                              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"><Play className="w-4 h-4 text-white ml-0.5" /></div>
                            </div>
                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-luxury-950/60 backdrop-blur-sm rounded text-white text-xs">{project.duration}</div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium text-luxury-100 text-sm truncate mb-2">{project.title}</h3>
                            <div className="flex items-center justify-between text-xs text-luxury-500">
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{project.views}</span>
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{project.likes}</span>
                              <span>{project.createdAt}</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="card overflow-hidden">
                    {filteredProjects.map((project, idx) => (
                      <motion.div key={project.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                        className="flex items-center gap-3 p-3 border-b border-glass-border hover:bg-glass-light transition-colors">
                        <Link to={`/detail/${project.id}`}><img src={project.thumbnail} alt={project.title} className="w-24 h-16 rounded-lg object-cover" /></Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/detail/${project.id}`}><h3 className="font-medium text-luxury-100 text-sm truncate group-hover:text-primary transition-colors">{project.title}</h3></Link>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-luxury-500">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{project.views}</span>
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{project.likes}</span>
                            <span>{project.createdAt}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button className="p-1.5 hover:bg-glass-light rounded-lg transition-colors"><Download className="w-4 h-4 text-luxury-500" /></button>
                          <button className="p-1.5 hover:bg-glass-light rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-luxury-500" /></button>
                          <button className="p-1.5 hover:bg-glass-light rounded-lg transition-colors"><MoreHorizontal className="w-4 h-4 text-luxury-500" /></button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                  <div className="card p-12 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 bg-luxury-800 rounded-xl flex items-center justify-center">
                      <Video className="w-6 h-6 text-luxury-500" />
                    </div>
                    <h3 className="text-base font-medium text-white mb-1">
                      {activeTab === 'published' ? '暂无作品' : '草稿箱为空'}
                    </h3>
                    <p className="text-xs text-luxury-500 mb-4">
                      {activeTab === 'published' ? '开始创作您的第一个广告作品吧' : '保存的草稿会显示在这里'}
                    </p>
                    <button onClick={() => navigate('/create')} className="btn-primary text-sm py-2">立即创作</button>
                  </div>
                )}
              </>
            )}

            {/* 我的收藏页面 */}
            {activeMenu === 'favorites' && (
              <>
                <div className="card p-1.5">
                  <span className="text-sm text-luxury-400 px-3 py-1.5">我的收藏</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map((project, idx) => (
                    <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="card group cursor-pointer overflow-hidden">
                      <Link to={`/detail/${project.id}`}>
                        <div className="relative aspect-video border-b border-glass-border">
                          <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-luxury-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                            <div className="flex items-center gap-2 text-white text-xs">
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{project.views}</span>
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{project.likes}</span>
                            </div>
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"><Play className="w-4 h-4 text-white ml-0.5" /></div>
                          </div>
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-luxury-950/60 backdrop-blur-sm rounded text-white text-xs">{project.duration}</div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-luxury-100 text-sm truncate mb-2">{project.title}</h3>
                          <div className="flex items-center justify-between text-xs text-luxury-500">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{project.views}</span>
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{project.likes}</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                {filteredProjects.length === 0 && (
                  <div className="card p-12 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 bg-luxury-800 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-luxury-500" />
                    </div>
                    <h3 className="text-base font-medium text-white mb-1">暂无收藏</h3>
                    <p className="text-xs text-luxury-500">收藏的作品会显示在这里</p>
                  </div>
                )}
              </>
            )}

            {/* 个人资料页面 */}
            {activeMenu === 'profile' && (
              <div className="space-y-4">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-medium text-white">个人资料</h3>
                    {!isEditing && (
                      <button 
                        onClick={() => {
                          // 检查是否有任何可编辑的字段
                          const editableFields = ['name', 'avatar', 'gender', 'age', 'bio'].filter(
                            field => canEditField(field)
                          )
                          if (editableFields.length === 0) {
                            alert('所有字段都已锁定，请30天后再更改')
                            return
                          }
                          setIsEditing(true)
                        }}
                        className="text-sm px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                      >
                        编辑资料
                      </button>
                    )}
                    {isEditing && (
                      <div className="flex gap-2">
                        <button onClick={handleCancelEdit} className="text-sm px-3 py-1.5 bg-luxury-700 text-luxury-300 rounded-lg hover:bg-luxury-600">取消</button>
                        <button onClick={handleSaveProfile} className="text-sm px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/80 flex items-center gap-1">
                          <Check className="w-4 h-4" />保存
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 头像 */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative">
                      <img 
                        src={isEditing ? editForm.avatar : (user?.avatar || 'https://i.pravatar.cc/100')} 
                        alt="avatar" 
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      {isEditing && canEditField('avatar') && hasFieldChanged('avatar', editForm.avatar) && (
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/80"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      )}
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm text-luxury-400">点击相机图标上传头像</p>
                      {!canEditField('avatar') && (
                        <p className="text-xs text-luxury-500 mt-1">下次可更改: {getNextEditDateForField('avatar')}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* 用户昵称 */}
                    <div>
                      <label className="block text-sm text-luxury-400 mb-1.5">用户昵称</label>
                      {isEditing ? (
                        canEditField('name') ? (
                          <input 
                            type="text" 
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="input-field text-sm"
                            placeholder="请输入昵称"
                          />
                        ) : (
                          <div className="input-field text-sm bg-luxury-800 text-luxury-500 cursor-not-allowed flex justify-between items-center">
                            <span>{user?.name || '未设置'}</span>
                            <span className="text-xs text-luxury-500">下次可更改: {getNextEditDateForField('name')}</span>
                          </div>
                        )
                      ) : (
                        <p className="text-luxury-100">{user?.name || '未设置'}</p>
                      )}
                    </div>

                    {/* 性别 */}
                    <div>
                      <label className="block text-sm text-luxury-400 mb-1.5">性别</label>
                      {isEditing ? (
                        canEditField('gender') ? (
                          <select 
                            value={editForm.gender}
                            onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                            className="input-field text-sm"
                          >
                            <option value="">请选择</option>
                            <option value="male">男</option>
                            <option value="female">女</option>
                            <option value="other">其他</option>
                          </select>
                        ) : (
                          <div className="input-field text-sm bg-luxury-800 text-luxury-500 cursor-not-allowed flex justify-between items-center">
                            <span>{user?.gender === 'male' ? '男' : user?.gender === 'female' ? '女' : user?.gender === 'other' ? '其他' : '未设置'}</span>
                            <span className="text-xs text-luxury-500">下次可更改: {getNextEditDateForField('gender')}</span>
                          </div>
                        )
                      ) : (
                        <p className="text-luxury-100">
                          {user?.gender === 'male' ? '男' : user?.gender === 'female' ? '女' : user?.gender === 'other' ? '其他' : '未设置'}
                        </p>
                      )}
                    </div>

                    {/* 年龄 */}
                    <div>
                      <label className="block text-sm text-luxury-400 mb-1.5">年龄</label>
                      {isEditing ? (
                        canEditField('age') ? (
                          <input 
                            type="number" 
                            value={editForm.age}
                            onChange={(e) => setEditForm(prev => ({ ...prev, age: e.target.value }))}
                            className="input-field text-sm"
                            placeholder="请输入年龄"
                            min="1"
                            max="150"
                          />
                        ) : (
                          <div className="input-field text-sm bg-luxury-800 text-luxury-500 cursor-not-allowed flex justify-between items-center">
                            <span>{user?.age || '未设置'}</span>
                            <span className="text-xs text-luxury-500">下次可更改: {getNextEditDateForField('age')}</span>
                          </div>
                        )
                      ) : (
                        <p className="text-luxury-100">{user?.age || '未设置'}</p>
                      )}
                    </div>

                    {/* 个人简介 */}
                    <div>
                      <label className="block text-sm text-luxury-400 mb-1.5">个人简介</label>
                      {isEditing ? (
                        canEditField('bio') ? (
                          <textarea 
                            value={editForm.bio}
                            onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                            className="input-field text-sm h-24 resize-none"
                            placeholder="介绍一下自己吧..."
                            maxLength={200}
                          />
                        ) : (
                          <div className="relative">
                            <div className="input-field text-sm h-24 resize-none bg-luxury-800 text-luxury-500 cursor-not-allowed overflow-auto pr-24">
                              {user?.bio || '暂无简介'}
                            </div>
                            <span className="absolute bottom-2 right-3 text-xs text-luxury-500">下次可更改: {getNextEditDateForField('bio')}</span>
                          </div>
                        )
                      ) : (
                        <p className="text-luxury-100">{user?.bio || '暂无简介'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 账号设置 */}
            {activeMenu === 'settings' && (
              <>
                <div className="card p-6">
                  <h3 className="text-base font-medium text-white mb-4">账号设置</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-luxury-900/50 rounded-xl">
                      <div>
                        <p className="text-sm text-luxury-100 font-medium">绑定手机</p>
                        <p className="text-xs text-luxury-500 mt-0.5">未绑定</p>
                      </div>
                      <button className="text-xs text-primary hover:text-primary/80">去绑定</button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-luxury-900/50 rounded-xl">
                      <div>
                        <p className="text-sm text-luxury-100 font-medium">绑定邮箱</p>
                        <p className="text-xs text-luxury-500 mt-0.5">未绑定</p>
                      </div>
                      <button className="text-xs text-primary hover:text-primary/80">去绑定</button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-luxury-900/50 rounded-xl">
                      <div>
                        <p className="text-sm text-luxury-100 font-medium">修改密码</p>
                        <p className="text-xs text-luxury-500 mt-0.5">定期修改密码保护账号安全</p>
                      </div>
                      <button className="text-xs text-primary hover:text-primary/80">去修改</button>
                    </div>
                  </div>
                </div>
                
                <div className="card p-6 border border-red-500/20">
                  <h3 className="text-base font-medium text-red-400 mb-4">危险操作</h3>
                  <div className="flex items-center justify-between p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                    <div>
                      <p className="text-sm text-luxury-100 font-medium">注销账号</p>
                      <p className="text-xs text-luxury-500 mt-0.5">一旦注销，所有数据将被清除且无法恢复</p>
                    </div>
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      注销账号
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* 资产管理 */}
            {activeMenu === 'assets' && (
              <div className="card p-12 text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-luxury-800 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-luxury-500" />
                </div>
                <h3 className="text-base font-medium text-white mb-1">资产管理</h3>
                <p className="text-xs text-luxury-500">功能开发中...</p>
              </div>
            )}

            {/* 注销账号确认弹框 */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-950/80 backdrop-blur-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-luxury-800 rounded-2xl border border-glass-border p-6 max-w-sm w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-7 h-7 text-red-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">确定要注销账号吗？</h3>
                      <p className="text-sm text-luxury-400 mb-6">
                        注销后将清除所有数据，包括作品、收藏、个人信息等，此操作不可恢复，请慎重考虑。
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 px-4 py-2.5 bg-luxury-700 text-luxury-200 rounded-xl text-sm font-medium hover:bg-luxury-600 transition-colors"
                        >
                          取消
                        </button>
                        <button 
                          onClick={() => {
                            logout()
                            setShowDeleteConfirm(false)
                            navigate('/create-guide')
                          }}
                          className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          确定注销
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}
