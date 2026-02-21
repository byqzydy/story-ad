import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface User {
  id: string
  name: string
  avatar: string
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  totalGenerations: number
  totalLikes: number
  totalViews: number
  // 扩展个人资料
  gender?: 'male' | 'female' | 'other'
  age?: number
  bio?: string
  // 各字段单独更新记录
  lastNameUpdate?: string
  lastAvatarUpdate?: string
  lastGenderUpdate?: string
  lastAgeUpdate?: string
  lastBioUpdate?: string
}

export interface AdProject {
  id: string
  title: string
  thumbnail: string
  author: User
  views: number
  likes: number
  favorites: number
  duration: string
  category: string
  style: string
  createdAt: string
  status: 'published' | 'draft'
}

export interface StoryTemplate {
  id: string
  name: string
  category: string
  thumbnail: string
  usageCount: number
}

// AI Project type
export interface AIProject {
  id: string
  name: string
  createdAt: string
  updatedAt?: string  // 最近编辑时间
  messages: { id: string; role: 'user' | 'ai'; content: string; timestamp: Date }[]
  canvasData?: {
    storyOutline?: string
    script?: string[]
    visualStatus?: 'pending' | 'generating' | 'completed'
  }
  // 上传的资源
  assets?: {
    productImages?: string[]  // 产品图
    brandLogo?: string        // 品牌logo
    scripts?: { name: string; url: string }[]  // 剧本文件
  }
}

// Store State
interface AppState {
  // Auth
  user: User | null
  isLoggedIn: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>, updatedFields?: string[]) => void
  
  // Create Flow
  currentStep: number
  storyConfig: {
    storyType: string
    adType: string
    audienceGender: string
    audienceAge: string
    duration: string
    platforms: string[]
    character: string
    characterImage: string | null
    characterImages: string[]  // 角色图片数组，最多3张
    characterNames: string[]  // 角色名称数组，最多3个
    characterDescriptions: string[]  // 角色描述数组，最多100字
    character2: string
    characterImage2: string | null
    productName: string
    productImage: string | null
    productLogo: string | null
    productImages: string[]
    productTone: string
    productDescription: string
    fusionLevel: number
    scene: string
    customScene: string
    visualStyle: string
    customVisualStyle: string
    music: string
    voice: string
    voiceStyle: string
    aspectRatio: string
    storyPrompt: string
    adCoreConcept: string  // 广告核心创作概念，不超过30字
    adEndingEmotion: string  // 广告结尾希望表达的情绪，不超过20字
  }
  setCurrentStep: (step: number) => void
  updateStoryConfig: (config: Partial<AppState['storyConfig']>) => void
  resetStoryConfig: () => void
  
  // Projects
  projects: AdProject[]
  addProject: (project: AdProject) => void
  
  // Templates
  templates: StoryTemplate[]
  
  // UI State
  isCreateModalOpen: boolean
  setCreateModalOpen: (open: boolean) => void
  
  // Login Modal
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
  showWelcomeGiftAfterLogin: boolean
  setShowWelcomeGiftAfterLogin: (show: boolean) => void

  // AI Projects (智能代理项目)
  aiProjects: AIProject[]
  addAIProject: (project: AIProject) => void
  updateAIProject: (id: string, updates: Partial<AIProject>) => void
  deleteAIProject: (id: string) => void
}

const defaultStoryConfig = {
  storyType: '不限',
  adType: '',
  audienceGender: '',
  audienceAge: '',
  duration: '30s',
  platforms: [],
  character: '',
  characterImage: null as string | null,
  characterImages: [] as string[],
  characterNames: [] as string[],
  characterDescriptions: [] as string[],
  character2: '',
  characterImage2: null as string | null,
  productName: '',
  productImage: null as string | null,
  productLogo: null as string | null,
  productImages: [] as string[],
  productTone: '',
  productDescription: '',
  fusionLevel: 50,
  scene: '不限',
  customScene: '',
  visualStyle: '',
  customVisualStyle: '',
  music: '',
  voice: 'female',
  voiceStyle: 'warm',
  aspectRatio: '9:16',
  storyPrompt: '',
  adCoreConcept: '',
  adEndingEmotion: '',
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      isLoggedIn: false,
      login: (user) => set({ user, isLoggedIn: true }),
      logout: () => {
        // Clear profile-related localStorage
        localStorage.removeItem('profile_activeMenu')
        localStorage.removeItem('profile_selectedProjectId')
        set({ user: null, isLoggedIn: false })
      },
      updateUser: (updates, updatedFields) => set((state) => {
        if (!state.user) return { user: null }
        
        const fieldTimestamps: Record<string, string> = {}
        if (updatedFields) {
          updatedFields.forEach(field => {
            fieldTimestamps[`last${field.charAt(0).toUpperCase()}${field.slice(1)}Update`] = new Date().toISOString()
          })
        }
        
        return { user: { ...state.user, ...updates, ...fieldTimestamps } }
      }),
      
      // Create Flow
      currentStep: 1,
      storyConfig: { ...defaultStoryConfig },
      setCurrentStep: (step) => set({ currentStep: step }),
      updateStoryConfig: (config) => set((state) => ({ 
        storyConfig: { ...state.storyConfig, ...config } 
      })),
      resetStoryConfig: () => set({ 
        currentStep: 1, 
        storyConfig: { ...defaultStoryConfig } 
      }),
      
      // Projects (mock data)
      projects: [
        {
          id: '1',
          title: '情人节限定礼物推荐',
          thumbnail: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=225&fit=crop',
          author: { id: '1', name: '小红', avatar: 'https://i.pravatar.cc/100?img=1', level: 'gold', totalGenerations: 128, totalLikes: 5420, totalViews: 125000 },
          views: 12500,
          likes: 2340,
          favorites: 456,
          duration: '30s',
          category: '美妆',
          style: '温馨',
          createdAt: '2026-02-10',
          status: 'published'
        },
        {
          id: '2',
          title: '创业路上的坚持',
          thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop',
          author: { id: '2', name: '阿杰', avatar: 'https://i.pravatar.cc/100?img=2', level: 'platinum', totalGenerations: 256, totalLikes: 8900, totalViews: 256000 },
          views: 25600,
          likes: 5670,
          favorites: 890,
          duration: '60s',
          category: '食品',
          style: '励志',
          createdAt: '2026-02-09',
          status: 'published'
        },
        {
          id: '3',
          title: '春节团圆饭',
          thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=225&fit=crop',
          author: { id: '3', name: '李老板', avatar: 'https://i.pravatar.cc/100?img=3', level: 'silver', totalGenerations: 45, totalLikes: 1200, totalViews: 35000 },
          views: 8900,
          likes: 1200,
          favorites: 234,
          duration: '30s',
          category: '食品',
          style: '温馨',
          createdAt: '2026-02-08',
          status: 'published'
        },
        {
          id: '4',
          title: '夏日清爽护肤指南',
          thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=225&fit=crop',
          author: { id: '4', name: '美妆达人', avatar: 'https://i.pravatar.cc/100?img=4', level: 'diamond', totalGenerations: 512, totalLikes: 25000, totalViews: 520000 },
          views: 52000,
          likes: 12500,
          favorites: 2340,
          duration: '15s',
          category: '美妆',
          style: '清爽',
          createdAt: '2026-02-07',
          status: 'published'
        },
        {
          id: '5',
          title: '科技改变生活',
          thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=225&fit=crop',
          author: { id: '5', name: '科技控', avatar: 'https://i.pravatar.cc/100?img=5', level: 'gold', totalGenerations: 180, totalLikes: 7800, totalViews: 180000 },
          views: 18000,
          likes: 4560,
          favorites: 678,
          duration: '30s',
          category: '3C',
          style: '科技',
          createdAt: '2026-02-06',
          status: 'published'
        },
        {
          id: '6',
          title: '妈妈的爱',
          thumbnail: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400&h=225&fit=crop',
          author: { id: '6', name: '温暖心', avatar: 'https://i.pravatar.cc/100?img=6', level: 'silver', totalGenerations: 67, totalLikes: 3200, totalViews: 78000 },
          views: 7800,
          likes: 2340,
          favorites: 567,
          duration: '60s',
          category: '服装',
          style: '感人',
          createdAt: '2026-02-05',
          status: 'published'
        },
        {
          id: '7',
          title: '双十一狂欢',
          thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=225&fit=crop',
          author: { id: '7', name: '购物狂', avatar: 'https://i.pravatar.cc/100?img=7', level: 'platinum', totalGenerations: 320, totalLikes: 15000, totalViews: 380000 },
          views: 38000,
          likes: 8900,
          favorites: 1560,
          duration: '15s',
          category: '服装',
          style: '促销',
          createdAt: '2026-02-04',
          status: 'published'
        },
        {
          id: '8',
          title: '宠物情缘',
          thumbnail: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=225&fit=crop',
          author: { id: '8', name: '铲屎官', avatar: 'https://i.pravatar.cc/100?img=8', level: 'gold', totalGenerations: 156, totalLikes: 9800, totalViews: 220000 },
          views: 22000,
          likes: 6780,
          favorites: 1230,
          duration: '30s',
          category: '宠物',
          style: '温馨',
          createdAt: '2026-02-03',
          status: 'published'
        }
      ],
      addProject: (project) => set((state) => ({ 
        projects: [project, ...state.projects] 
      })),
      
      // Templates (mock data)
      templates: [
        { id: '1', name: '春节团圆', category: '节日营销', thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop', usageCount: 12500 },
        { id: '2', name: '情人节礼物', category: '节日营销', thumbnail: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&h=200&fit=crop', usageCount: 9800 },
        { id: '3', name: '母亲节感恩', category: '节日营销', thumbnail: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=300&h=200&fit=crop', usageCount: 7600 },
        { id: '4', name: '双十一狂欢', category: '节日营销', thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&h=200&fit=crop', usageCount: 15600 },
        { id: '5', name: '好物分享', category: '产品种草', thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=200&fit=crop', usageCount: 22000 },
        { id: '6', name: '使用教程', category: '产品种草', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop', usageCount: 18500 },
        { id: '7', name: '对比测评', category: '产品种草', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop', usageCount: 14200 },
        { id: '8', name: '创业故事', category: '品牌故事', thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop', usageCount: 8900 },
        { id: '9', name: '成长蜕变', category: '品牌故事', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop', usageCount: 6700 },
        { id: '10', name: '用户证言', category: '品牌故事', thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=200&fit=crop', usageCount: 5400 }
      ],
      
      // UI State
      isCreateModalOpen: false,
      setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
      
      // Login Modal
      showLoginModal: false,
      setShowLoginModal: (show) => set({ showLoginModal: show }),
      showWelcomeGiftAfterLogin: false,
      setShowWelcomeGiftAfterLogin: (show) => set({ showWelcomeGiftAfterLogin: show }),

      // AI Projects
      aiProjects: [],
      addAIProject: (project) => set((state) => ({ 
        aiProjects: [project, ...state.aiProjects] 
      })),
      updateAIProject: (id, updates) => set((state) => ({
        aiProjects: state.aiProjects.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      deleteAIProject: (id) => set((state) => ({
        aiProjects: state.aiProjects.filter(p => p.id !== id)
      })),
    }),
    {
      name: 'story-ad-storage',
    }
  )
)
