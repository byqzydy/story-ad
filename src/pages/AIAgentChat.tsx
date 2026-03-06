import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Sparkles, Layers, Bot, Clapperboard, Crown, 
  User, LogOut, MessageSquare, Send, Image, FileText, X, Shield, MessageCircle, Trash2
} from 'lucide-react'
import { useStore, type AIProject } from '../store'
import { generateAIResponse } from '../services/agentSystem'
import Logo from '../components/Logo'
import ConfirmDialog, { useConfirmDialog } from '../components/ConfirmDialog'

// Navbar for AI Agent Chat Page - same as CreationGuide but with 智能代理 selected
function Navbar({ onModeChange }: { onModeChange: (mode: string) => void }) {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout, setShowLoginModal } = useStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <Logo size="md" />

        {/* Creation Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-luxury-800/50 rounded-xl border border-glass-border">
          <button
            onClick={() => onModeChange('free')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-luxury-400 hover:text-white hover:bg-luxury-700"
          >
            <Layers className="w-4 h-4" />
            自由混合
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-ambient-blue to-ambient-purple text-white shadow-soft"
          >
            <Bot className="w-4 h-4" />
            智能代理
          </button>
          <button
            onClick={() => onModeChange('movie')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-luxury-400 hover:text-white hover:bg-luxury-700"
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

interface UploadedFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'document'
}

// Chat Input Component - similar to AIAgent's second column chat input
function ChatInput({ onSend, disabled = false }: { onSend: (message: string, files?: UploadedFile[]) => void; disabled?: boolean }) {
  const [input, setInput] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [chatMode, setChatMode] = useState<'托管' | '对话'>('对话')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const isImage = type === 'image' || file.type.startsWith('image/')
      const preview = isImage ? URL.createObjectURL(file) : file.name

      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        file,
        preview,
        type: isImage ? 'image' : 'document'
      }

      setUploadedFiles(prev => [...prev, newFile])
    })

    e.target.value = ''
  }

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file && file.type === 'image') {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const handleSend = () => {
    if (input.trim() || uploadedFiles.length > 0) {
      onSend(input, uploadedFiles.length > 0 ? uploadedFiles : undefined)
      setInput('')
      uploadedFiles.forEach(f => {
        if (f.type === 'image') {
          URL.revokeObjectURL(f.preview)
        }
      })
      setUploadedFiles([])
    }
  }

  const hasFiles = uploadedFiles.length > 0

  return (
    <div className="bg-luxury-800 rounded-xl border-2 border-ambient-blue/50 focus-within:border-ambient-blue transition-colors p-3">
      {/* Uploaded Files Preview */}
      {hasFiles && (
        <div className="flex flex-wrap gap-2 mb-2">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="relative group">
              {file.type === 'image' ? (
                <div className="w-11 h-11 rounded-lg overflow-hidden border border-luxury-600">
                  <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-lg bg-luxury-700 border border-luxury-600 flex items-center justify-center relative">
                  <FileText className="w-4 h-4 text-luxury-400" />
                  <span className="absolute bottom-0 left-0 right-0 text-[6px] text-center text-luxury-400 truncate px-0.5 bg-luxury-800/80">{file.file.name.slice(0, 6)}...</span>
                </div>
              )}
              <button
                onClick={() => handleRemoveFile(file.id)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Text Input Area - Full Width */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
        placeholder="尝试描述您的产品特点、目标受众和期望的广告风格，例如：'为年轻人设计一款运动耳机的促销广告，突出时尚感和性价比'"
        rows={6}
        disabled={disabled}
        className="w-full bg-transparent text-sm placeholder-luxury-500 focus:outline-none resize-none leading-relaxed text-white"
      />
      
      {/* Bottom Row: Upload Buttons and Mode Toggle */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileUpload(e, 'image')}
            className="hidden"
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-luxury-400 hover:text-white hover:bg-luxury-700 transition-colors text-xs"
            title="上传图片"
          >
            <Image className="w-4 h-4" />
            <span>图片</span>
          </button>
          <input
            ref={docInputRef}
            type="file"
            accept=".doc,.docx,.txt,.pdf"
            multiple
            onChange={(e) => handleFileUpload(e, 'document')}
            className="hidden"
          />
          <button
            onClick={() => docInputRef.current?.click()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-luxury-400 hover:text-white hover:bg-luxury-700 transition-colors text-xs"
            title="上传剧本"
          >
            <FileText className="w-4 h-4" />
            <span>文件</span>
          </button>
        </div>

        {/* Mode Toggle Buttons - Bottom Right with semi-transparent background */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1.5 bg-luxury-700/50 rounded-lg">
            <button
              onClick={() => setChatMode('托管')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                chatMode === '托管' 
                  ? 'bg-ambient-purple text-white' 
                  : 'text-luxury-400 hover:text-white hover:bg-luxury-600'
              }`}
              title="托管模式"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>托管模式</span>
            </button>
            <button
              onClick={() => setChatMode('对话')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                chatMode === '对话' 
                  ? 'bg-ambient-blue text-white' 
                  : 'text-luxury-400 hover:text-white hover:bg-luxury-600'
              }`}
              title="对话模式"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>对话模式</span>
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={(!input.trim() && uploadedFiles.length === 0) || disabled}
            className="p-2 bg-gradient-to-r from-ambient-blue to-ambient-purple text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity ml-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Project Cover Card Component - matching Movie projects style in Profile
function ProjectCoverCard({ project, onClick, onDelete }: { 
  project: AIProject; 
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="card group cursor-pointer overflow-hidden border-2 border-transparent hover:border-primary transition-all relative"
    >
      <div className="relative aspect-video bg-luxury-800">
        {/* Cover Image - using thumbnail or placeholder */}
        <img 
          src={project.thumbnail || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400'} 
          alt={project.name}
          className="w-full h-full object-cover"
        />
        
        {/* Delete Button - appears on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          title="删除项目"
        >
          <Trash2 className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
      <div className="p-3">
        <h4 className="text-white text-sm font-medium truncate">{project.name}</h4>
        <p className="text-luxury-500 text-xs mt-1">
          {new Date(project.createdAt).toLocaleDateString('zh-CN')}
        </p>
      </div>
    </motion.div>
  )
}

export default function AIAgentChat() {
  const navigate = useNavigate()
  const { aiProjects, addAIProject, deleteAIProject, isLoggedIn, setShowLoginModal, setShowWelcomeGiftAfterLogin } = useStore()
  const [isCreating, setIsCreating] = useState(false)
  
  // Delete confirmation dialog
  const deleteConfirm = useConfirmDialog()

  // Handle mode change for navigation tabs
  const handleModeChange = (mode: string) => {
    if (mode === 'free') {
      navigate('/create-guide')
    } else if (mode === 'movie') {
      if (!isLoggedIn) {
        setShowWelcomeGiftAfterLogin(true)
        setShowLoginModal(true)
        return
      }
      navigate('/movie-placement-home')
    }
  }

  // Get 5 latest projects sorted by creation date
  const latestProjects = [...aiProjects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Handle send message - create new project and navigate to AI Agent page
  const handleSend = async (content: string, files?: UploadedFile[]) => {
    if (!isLoggedIn) {
      setShowWelcomeGiftAfterLogin(true)
      setShowLoginModal(true)
      return
    }

    setIsCreating(true)
    
    try {
      // Call AI to generate response
      const result = await generateAIResponse(content, [], files ? files.map(f => ({ type: f.type, name: f.file.name, preview: f.preview })) : undefined)
      
      // Create new project with user message and AI response
      const newProject: AIProject = {
        id: Date.now().toString(),
        name: content.slice(0, 10) + (content.length > 10 ? '...' : ''),
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
          },
          {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: result.response,
            timestamp: new Date()
          }
        ],
        canvasData: {}
      }
      
      // Add project to store
      addAIProject(newProject)
      
      // Navigate to AI Agent page with the new project
      navigate(`/ai-agent?projectId=${newProject.id}`, { state: { returnPath: '/ai-agent-chat' } })
    } catch (error) {
      console.error('Failed to create project:', error)
      setIsCreating(false)
    }
  }

  // Handle project click - navigate to AI Agent page
  const handleProjectClick = (projectId: string) => {
    navigate(`/ai-agent?projectId=${projectId}`, { state: { returnPath: '/ai-agent-chat' } })
  }

  // Handle delete project with confirmation
  const handleDeleteProject = (projectId: string) => {
    const project = aiProjects.find(p => p.id === projectId)
    const projectName = project?.name || '该项目'
    
    deleteConfirm.confirm({
      title: '删除项目',
      message: `确定要删除"${projectName}"吗？此操作不可恢复，所有聊天记录将被永久删除。`,
      confirmText: '删除',
      cancelText: '取消',
      variant: 'danger',
      onConfirm: () => {
        deleteAIProject(projectId)
      }
    })
  }

  return (
    <div className="min-h-screen bg-luxury-950">
      <Navbar onModeChange={handleModeChange} />
      
      <main className="pt-40 pb-12 max-w-6xl mx-auto px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3">
            聊天的方式完成你的<span className="gradient-text">创作</span>
          </h1>
          <p className="text-luxury-400 text-base max-w-md mx-auto">
            描述您的广告需求，AI智能为您生成专业级视频内容
          </p>
        </motion.div>

        {/* Chat Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <ChatInput onSend={handleSend} disabled={isCreating} />
        </motion.div>

        {/* Recent Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="pt-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-luxury-400" />
            <h2 className="text-base font-medium text-white">已有项目</h2>
            {latestProjects.length > 0 && (
              <span className="text-xs text-luxury-500">（展示最新5个）</span>
            )}
          </div>

          {latestProjects.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {latestProjects.map((project) => (
                <ProjectCoverCard
                  key={project.id}
                  project={project}
                  onClick={() => handleProjectClick(project.id)}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <MessageSquare className="w-10 h-10 text-luxury-600 mx-auto mb-3" />
              <h3 className="text-base font-medium text-white mb-1">暂无项目</h3>
              <p className="text-sm text-luxury-500">
                在上方输入您的广告需求，开始创作第一个项目
              </p>
            </div>
          )}
        </motion.div>
      </main>
      
      {/* Delete Confirmation Dialog */}
      {deleteConfirm.Dialog}
    </div>
  )
}
