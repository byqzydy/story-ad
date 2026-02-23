import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  ArrowLeft, Sparkles, Plus, Layers, Bot,
  Send, Image, FileText, Share2, ZoomIn, ZoomOut,
  MessageSquare, User, Bot as BotIcon, Crown, LogOut, User as UserIcon, X, Trash2
} from 'lucide-react'
import { useStore, type AIProject } from '../store'
import { generateAIResponse } from '../services/aiService'

// Navbar for AI Agent Page (same style as CreationGuide, with 智能代理 selected)
function Navbar() {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout, setShowLoginModal } = useStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="w-full px-8 py-4 flex items-center justify-between">
        {/* Left: Logo and Name - gray by default, theme color on hover */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-luxury-700 group-hover:bg-gradient-to-r group-hover:from-ambient-blue group-hover:to-ambient-purple transition-all">
            <Sparkles className="w-5 h-5 text-luxury-400 group-hover:text-white transition-colors" />
          </div>
          <span className="text-xl font-semibold text-luxury-400 group-hover:bg-gradient-to-r group-hover:from-ambient-blue group-hover:to-ambient-purple group-hover:bg-clip-text group-hover:text-transparent tracking-tight transition-all">虹忆坊</span>
        </Link>

        {/* Center: Creation Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-luxury-800/50 rounded-xl border border-glass-border">
          <button
            onClick={() => navigate('/create-guide')}
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
        </div>

        {/* Right: User actions */}
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
                    <UserIcon className="w-4 h-4" />个人中心
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

// Column 1: Sidebar (narrower, no "打开已有项目")
function Sidebar({ projects, activeProject, onSelectProject, onNewProject, onDeleteProject }: {
  projects: { id: string; name: string; date: string }[]
  activeProject: string | null
  onSelectProject: (id: string | null) => void
  onNewProject: () => void
  onDeleteProject: (id: string) => void
}) {
  return (
    <div className="w-40 bg-luxury-900 border-r border-glass-border flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="text-[10px] text-luxury-500 px-1 py-1">项目</div>
        {projects.length === 0 ? (
          <div className="text-[10px] text-luxury-600 px-1 py-2">暂无项目</div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={`group flex items-center gap-1 px-1 py-1.5 rounded text-left transition-colors cursor-pointer ${
                activeProject === project.id
                  ? 'bg-ambient-blue/20 text-white'
                  : 'text-luxury-400 hover:bg-luxury-800 hover:text-white'
              }`}
            >
              <button
                onClick={() => onSelectProject(project.id)}
                className="flex items-center gap-1 flex-1 min-w-0"
              >
                <MessageSquare className="w-3 h-3 flex-shrink-0" />
                <div className="text-xs truncate">{project.name}</div>
              </button>
              {/* Delete button - appears on hover at right of project name */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteProject(project.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-luxury-500 hover:text-red-400 transition-all flex-shrink-0"
                title="删除项目"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
        
        {/* New Project Button - right after last project */}
        <div className="px-1 py-2">
          <button
            onClick={onNewProject}
            className="w-full flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-ambient-blue to-ambient-purple text-white rounded-lg text-xs hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3 h-3" />
            新建项目
          </button>
        </div>
      </div>
    </div>
  )
}

// Column 2: Chat Messages + Input (project name + share button)
interface UploadedFile {
  id: string
  file: File
  preview: string
  type: 'image' | 'document'
}

function ChatArea({ messages, projectName, onProjectNameChange, onSend, isEmpty, hasProject }: {
  messages: { id: string; role: 'user' | 'ai'; content: string; timestamp: Date }[]
  projectName: string
  onProjectNameChange: (name: string) => void
  onSend: (message: string, files?: UploadedFile[]) => void
  isEmpty: boolean
  hasProject: boolean
}) {
  const [input, setInput] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const isImage = type === 'image' || file.type.startsWith('image/')
      const preview = isImage 
        ? URL.createObjectURL(file)
        : file.name

      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        file,
        preview,
        type: isImage ? 'image' : 'document'
      }

      setUploadedFiles(prev => [...prev, newFile])
    })

    // Reset input
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
      // Clear uploaded files
      uploadedFiles.forEach(f => {
        if (f.type === 'image') {
          URL.revokeObjectURL(f.preview)
        }
      })
      setUploadedFiles([])
    }
  }

  // Calculate input container height based on uploaded files
  const hasFiles = uploadedFiles.length > 0

  return (
    <div className="w-[420px] bg-luxury-900 border-r border-glass-border flex flex-col h-full">
      {/* Project Name Header with Share Button */}
      <div className="px-4 py-3 border-b border-glass-border flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="未命名项目"
          className="flex-1 bg-transparent border-none text-white text-sm font-medium focus:outline-none"
        />
        <button className="flex items-center gap-1 px-2 py-1 bg-luxury-700 text-luxury-400 text-xs rounded cursor-not-allowed">
          <Share2 className="w-3 h-3" />
          分享
        </button>
      </div>

      {/* Messages - scrollable area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isEmpty ? (
          <div className="text-center text-luxury-500 py-8">
            <BotIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">开始与AI对话</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-ambient-blue' : 'bg-ambient-purple'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <BotIcon className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === 'user' 
                  ? 'bg-ambient-blue/20 text-white' 
                  : 'bg-luxury-800 text-luxury-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - fixed at bottom with highlight border, increased height by 1.5x */}
      <div className="p-3 border-t border-glass-border shrink-0">
        <div className={`bg-luxury-800 rounded-xl border-2 border-ambient-blue/50 focus-within:border-ambient-blue transition-colors p-3`}>
          
          {/* Uploaded Files Preview - thumbnails reduced by 1/3 */}
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
                  {/* Delete button - appears on hover */}
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
          
          {/* Input row with textarea - text area close to border */}
          <div className="flex items-end gap-2">
            {/* Upload buttons at bottom-left */}
            <div className="flex gap-1 pb-0.5">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e, 'image')}
                className="hidden"
              />
              <button
                onClick={() => {
                  if (!hasProject) {
                    alert('新建项目后才可以开始创作')
                    return
                  }
                  imageInputRef.current?.click()
                }}
                className={`p-1.5 rounded-lg transition-colors ${hasProject ? 'text-luxury-400 hover:text-white hover:bg-luxury-700' : 'text-luxury-600 cursor-not-allowed'}`}
                title="上传图片"
              >
                <Image className="w-4 h-4" />
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
                onClick={() => {
                  if (!hasProject) {
                    alert('新建项目后才可以开始创作')
                    return
                  }
                  docInputRef.current?.click()
                }}
                className={`p-1.5 rounded-lg transition-colors ${hasProject ? 'text-luxury-400 hover:text-white hover:bg-luxury-700' : 'text-luxury-600 cursor-not-allowed'}`}
                title="上传剧本"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
            
            {/* Text input - textarea close to border */}
            <textarea
              value={input}
              onChange={(e) => {
                if (!hasProject) {
                  alert('新建项目后才可以开始创作')
                  return
                }
                setInput(e.target.value)
              }}
              onClick={() => {
                if (!hasProject) {
                  alert('新建项目后才可以开始创作')
                }
              }}
              onKeyDown={(e) => {
                if (!hasProject) {
                  e.preventDefault()
                  alert('新建项目后才可以开始创作')
                  return
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder={hasProject ? "描述您的广告需求..." : "新建项目后才可以开始创作"}
              rows={3}
              disabled={!hasProject}
              className={`flex-1 bg-transparent text-sm placeholder-luxury-500 focus:outline-none resize-none leading-relaxed py-0 ${!hasProject ? 'cursor-not-allowed' : ''}`}
            />
            
            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={(!input.trim() && uploadedFiles.length === 0) || !hasProject}
              className="p-1.5 bg-gradient-to-r from-ambient-blue to-ambient-purple text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Column 3: Canvas
function Canvas({ zoom, setZoom, isEmpty, canvasData }: { 
  zoom: number
  setZoom: (zoom: number) => void
  isEmpty: boolean
  canvasData?: AIProject['canvasData']
}) {
  return (
    <div className="flex-1 bg-luxury-950 relative overflow-hidden">
      {/* Canvas Background Pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }} />

      {/* Canvas Content */}
      <div 
        className="absolute inset-4 bg-luxury-900 rounded-2xl border border-glass-border shadow-soft overflow-hidden flex flex-col"
      >
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <BotIcon className="w-16 h-16 text-luxury-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">等待创作</h3>
            <p className="text-sm text-luxury-500">在左侧开始新对话或选择已有项目</p>
          </div>
        ) : canvasData?.storyOutline ? (
          <>
            {/* Stage Results Header */}
            <div className="px-6 py-4 border-b border-glass-border bg-luxury-800/50 shrink-0">
              <h3 className="text-lg font-semibold text-white">阶段性成果</h3>
              <p className="text-sm text-luxury-400">AI 正在生成您的广告内容</p>
            </div>

            {/* Content Area - scrollable */}
            <div className="flex-1 overflow-y-auto">
              {/* Stage 1: Story Outline */}
              {canvasData.storyOutline && (
                <div className="bg-luxury-800/50 p-4 border-b border-glass-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-ambient-blue flex items-center justify-center text-white text-xs">1</div>
                    <h4 className="text-white font-medium">故事大纲</h4>
                    <span className="text-xs text-ambient-green px-2 py-0.5 bg-ambient-green/20 rounded-full">已完成</span>
                  </div>
                  <p className="text-luxury-300 text-sm whitespace-pre-wrap">{canvasData.storyOutline}</p>
                </div>
              )}

              {/* Stage 2: Script */}
              {canvasData.script && canvasData.script.length > 0 && (
                <div className="bg-luxury-800/50 p-4 border-b border-glass-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-ambient-purple flex items-center justify-center text-white text-xs">2</div>
                    <h4 className="text-white font-medium">分镜脚本</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      canvasData.visualStatus === 'completed' 
                        ? 'text-ambient-green bg-ambient-green/20' 
                        : canvasData.visualStatus === 'generating'
                        ? 'text-ambient-cyan bg-ambient-cyan/20'
                        : 'text-ambient-cyan bg-ambient-cyan/20'
                    }`}>
                      {canvasData.visualStatus === 'completed' ? '已完成' : canvasData.visualStatus === 'generating' ? '生成中' : '生成中'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {canvasData.script.map((shot, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <span className="text-luxury-500 w-8">镜头{idx + 1}</span>
                        <span className="text-luxury-300">{shot}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage 3: Visual */}
              <div className={`bg-luxury-800/50 p-4 ${canvasData.visualStatus !== 'completed' ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-luxury-600 flex items-center justify-center text-white text-xs">3</div>
                  <h4 className="text-white font-medium">视觉生成</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    canvasData.visualStatus === 'completed' 
                      ? 'text-ambient-green bg-ambient-green/20' 
                      : canvasData.visualStatus === 'generating'
                      ? 'text-ambient-cyan bg-ambient-cyan/20'
                      : 'text-luxury-500 bg-luxury-700'
                  }`}>
                    {canvasData.visualStatus === 'completed' ? '已完成' : canvasData.visualStatus === 'generating' ? '生成中' : '等待中'}
                  </span>
                </div>
                <p className="text-luxury-500 text-sm">
                  {canvasData.visualStatus === 'completed' ? '视觉素材已生成完成' : '等待分镜脚本完成后生成'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <BotIcon className="w-16 h-16 text-luxury-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">等待创作</h3>
            <p className="text-sm text-luxury-500">AI正在为您生成内容...</p>
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      {!isEmpty && canvasData?.storyOutline && (
        <div className="absolute bottom-6 right-6 flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-2 bg-luxury-800 border border-glass-border rounded-lg text-luxury-400 hover:text-white hover:bg-luxury-700 transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="px-3 py-1 bg-luxury-800 border border-glass-border rounded-lg text-white text-sm">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            className="p-2 bg-luxury-800 border border-glass-border rounded-lg text-luxury-400 hover:text-white hover:bg-luxury-700 transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

// Convert uploaded files to the format expected by AI service
const convertUploadedFiles = (files: UploadedFile[]) => {
  return files.map(f => ({
    type: f.type as 'image' | 'document',
    name: f.file.name,
    preview: f.preview
  }))
}

export default function AIAgent() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { aiProjects, addAIProject, updateAIProject, deleteAIProject } = useStore()
  
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [isTyping, setIsTyping] = useState(false)

  // Handle URL parameter for project selection
  useEffect(() => {
    const projectIdFromUrl = searchParams.get('projectId')
    if (projectIdFromUrl) {
      // Check if project exists
      const project = aiProjects.find(p => p.id === projectIdFromUrl)
      if (project) {
        setActiveProjectId(projectIdFromUrl)
        setPendingProjectId(null)
        // Clear the URL parameter after selecting
        setSearchParams({})
      }
    }
  }, [searchParams, aiProjects, setSearchParams])

  // Auto-select the most recently edited project on page load
  useEffect(() => {
    // Only auto-select if there's no active project and no URL parameter
    const projectIdFromUrl = searchParams.get('projectId')
    if (!activeProjectId && !pendingProjectId && !projectIdFromUrl && aiProjects.length > 0) {
      // Find the most recently updated project
      const sortedProjects = [...aiProjects].sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt
        const dateB = b.updatedAt || b.createdAt
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      })
      const latestProject = sortedProjects[0]
      if (latestProject) {
        setActiveProjectId(latestProject.id)
      }
    }
  }, [aiProjects, activeProjectId, pendingProjectId, searchParams])

  // Get current project from store (for sidebar selection)
  const currentProject = aiProjects.find(p => p.id === activeProjectId)
  
  // Get pending project (for new project without canvas content)
  const pendingProject = aiProjects.find(p => p.id === pendingProjectId)

  // Handle new project (新建对话) - creates project but doesn't set as active
  const handleNewProject = () => {
    const newProject: AIProject = {
      id: Date.now().toString(),
      name: '新项目',
      createdAt: new Date().toISOString(),
      messages: [{
        id: Date.now().toString(),
        role: 'ai',
        content: `🎬 您好！我是虹忆坊智能广告代理

作为电影叙事广告制作专家，我将帮助您创作具有电影质感的广告作品。

**我可以为您做：**
• 🎯 基于产品特点设计独特的科幻电影叙事
• 🎬 生成专业分镜脚本和拍摄指令  
• 🎨 提供视觉风格和色彩方案建议
• 🎵 规划声音设计和配乐方向
• 🚀 适配多种时长和平台版本

**请告诉我您的需求：**
您想为什么产品创作广告？产品的核心卖点是什么？您希望呈现什么样的风格和情绪？

期待与您一起创作精彩的作品！`,
        timestamp: new Date()
      }],
      canvasData: {}
    }
    // Add to store
    addAIProject(newProject)
    // Set as pending (shows in chat area but not in canvas)
    setPendingProjectId(newProject.id)
    // Clear active project (canvas shows empty state)
    setActiveProjectId(null)
  }

  // Handle select project from sidebar
  const handleSelectProject = (id: string | null) => {
    setActiveProjectId(id)
    setPendingProjectId(null)
  }

  // Handle sending message - now async for AI service
  const handleSend = async (content: string, files?: UploadedFile[]) => {
    const targetProjectId = activeProjectId || pendingProjectId
    if (!targetProjectId) return
    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content,
      timestamp: new Date()
    }
    // Get current messages
    const project = aiProjects.find(p => p.id === targetProjectId)
    const currentMessages = project?.messages || []
    const newMessages = [...currentMessages, userMsg]
    updateAIProject(targetProjectId, {
      messages: newMessages,
      updatedAt: new Date().toISOString()
    })
    // If this is a new project (name is default), update name to first 5 chars
    if (project?.name === '新项目' && content.length > 0) {
      const newName = content.slice(0, 5) + (content.length > 5 ? '...' : '')
      updateAIProject(targetProjectId, { name: newName })
    }
    // Simulate AI typing
    setIsTyping(true)
    try {
      // Call the AI service with conversation history
      const historyForAI = currentMessages
        .filter(m => m.role === 'user' || m.role === 'ai')
        .map(m => ({ role: m.role, content: m.content }))
      
      const result = await generateAIResponse(content, historyForAI, files ? convertUploadedFiles(files) : undefined)
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai' as const,
        content: result.response,
        timestamp: new Date()
      }
      
      // Preserve existing canvas data if no new data returned
      const existingProject = aiProjects.find(p => p.id === targetProjectId)
      const existingCanvasData = existingProject?.canvasData
      const canvasData = result.canvasData ? {
        storyOutline: result.canvasData.storyOutline,
        script: result.canvasData.script,
        visualStatus: result.canvasData.visualStatus
      } : (existingCanvasData || undefined)
      // Use the newMessages array we already have, plus the AI message
      updateAIProject(targetProjectId, {
        messages: [...newMessages, aiMsg],
        canvasData,
        updatedAt: new Date().toISOString()
      })
      // If this was a pending project, now set it as active to show canvas
      if (pendingProjectId === targetProjectId) {
        setActiveProjectId(targetProjectId)
        setPendingProjectId(null)
      }
    } catch (error) {
      console.error('AI response error:', error)
      // Fallback error message
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai' as const,
        content: '抱歉，我遇到了一些问题。请稍后再试，或者尝试重新描述您的需求。',
        timestamp: new Date()
      }
      updateAIProject(targetProjectId, {
        messages: [...newMessages, errorMsg],
        updatedAt: new Date().toISOString()
      })
    } finally {
      setIsTyping(false)
    }
  }

  // Generate canvas data from conversation
  const generateCanvasData = (userMsg: string, aiResponse: string): AIProject['canvasData'] => {
    return {
      storyOutline: `基于您的需求"${userMsg.slice(0, 20)}${userMsg.length > 20 ? '...' : ''}"，为您生成故事大纲：\n\n主人公是一位追求品质生活的消费者，在日常生活中发现了这款产品带来的改变...`,
      script: [
        '开场：生活场景，自然引入',
        '产品展示：突出核心卖点',
        '情感升华：品牌理念传递'
      ],
      visualStatus: 'generating'
    }
  }

  // Handle project name change
  const handleProjectNameChange = (name: string) => {
    const targetProjectId = activeProjectId || pendingProjectId
    if (!targetProjectId) return
    updateAIProject(targetProjectId, { name, updatedAt: new Date().toISOString() })
  }

  // Handle delete project
  const handleDeleteProject = (projectId: string) => {
    // If deleting the current active project, clear it and select the first remaining project
    if (activeProjectId === projectId) {
      setActiveProjectId(null)
    }
    // If deleting the pending project, clear it
    if (pendingProjectId === projectId) {
      setPendingProjectId(null)
    }
    
    // Delete from store
    deleteAIProject(projectId)
    
    // After deletion, if we deleted the active project, select the first remaining project
    if (activeProjectId === projectId) {
      // Use setTimeout to ensure the store is updated
      setTimeout(() => {
        const remainingProjects = aiProjects.filter(p => p.id !== projectId)
        if (remainingProjects.length > 0) {
          setActiveProjectId(remainingProjects[0].id)
        }
      }, 0)
    }
  }

  // Convert store projects to sidebar format
  const sidebarProjects = aiProjects.map(p => ({
    id: p.id,
    name: p.name,
    date: new Date(p.createdAt).toLocaleDateString('zh-CN')
  }))

  // Determine which project to show in chat area
  const chatProject = currentProject || pendingProject
  
  // Determine if canvas should show empty state
  const showEmptyCanvas = !currentProject || !currentProject.canvasData?.storyOutline

  return (
    <div className="h-screen bg-luxury-950 flex flex-col overflow-hidden">
      <Navbar />
      
      {/* Three Column Layout */}
      <div className="flex flex-1 pt-20 overflow-hidden">
        {/* Column 1: Sidebar (narrower) */}
        <Sidebar
          projects={sidebarProjects}
          activeProject={activeProjectId}
          onSelectProject={handleSelectProject}
          onNewProject={handleNewProject}
          onDeleteProject={handleDeleteProject}
        />

        {/* Column 2: Chat Area (messages + input) */}
        <ChatArea
          messages={chatProject?.messages || []}
          projectName={chatProject?.name || '新项目'}
          onProjectNameChange={handleProjectNameChange}
          onSend={handleSend}
          isEmpty={!chatProject}
          hasProject={!!chatProject}
        />

        {/* Column 3: Canvas */}
        <Canvas 
          zoom={zoom} 
          setZoom={setZoom} 
          isEmpty={showEmptyCanvas} 
          canvasData={currentProject?.canvasData}
        />
      </div>
    </div>
  )
}
