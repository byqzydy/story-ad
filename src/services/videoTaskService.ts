/**
 * Video Task API Service
 * 
 * Handles communication with backend video task API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export interface VideoClip {
  id: string
  index: number
  prompt: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  taskId?: string
  videoUrl?: string
  localPath?: string
  thumbnailUrl?: string
  startTime: number
  endTime: number
  error?: string
}

export interface VideoTask {
  id: string
  name: string
  productName: string
  productDescription: string
  productImages: string[]
  productLogo: string
  movieName: string
  movieType: string
  duration: string
  aspectRatio: string
  script: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
  clips: VideoClip[]
}

export interface CreateTaskParams {
  name: string
  productName?: string
  productDescription?: string
  productImages?: string[]
  productLogo?: string
  movieName?: string
  movieType?: string
  duration?: string
  aspectRatio?: string
  script?: string
  clips: Omit<VideoClip, 'id' | 'status' | 'taskId' | 'videoUrl' | 'localPath'>[]
}

/**
 * Create a new video task
 */
export async function createVideoTask(params: CreateTaskParams): Promise<VideoTask> {
  const response = await fetch(`${API_BASE_URL}/video-tasks/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...params,
      clips: params.clips.map((clip, index) => ({
        ...clip,
        id: `clip_${Date.now()}_${index}`,
        status: 'pending'
      }))
    })
  })
  
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create task')
  }
  
  return data.task
}

/**
 * Get all video tasks
 */
export async function getVideoTasks(): Promise<VideoTask[]> {
  const response = await fetch(`${API_BASE_URL}/video-tasks/list`)
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to get tasks')
  }
  
  return data.tasks
}

/**
 * Get single video task by ID
 */
export async function getVideoTask(taskId: string): Promise<VideoTask> {
  const response = await fetch(`${API_BASE_URL}/video-tasks/${taskId}`)
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to get task')
  }
  
  return data.task
}

/**
 * Update video task
 */
export async function updateVideoTask(taskId: string, updates: Partial<VideoTask>): Promise<VideoTask> {
  const response = await fetch(`${API_BASE_URL}/video-tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  })
  
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to update task')
  }
  
  return data.task
}

/**
 * Delete video task
 */
export async function deleteVideoTask(taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/video-tasks/${taskId}`, {
    method: 'DELETE'
  })
  
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete task')
  }
}

/**
 * Retry failed clips
 */
export async function retryVideoTask(taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/video-tasks/${taskId}/retry`, {
    method: 'POST'
  })
  
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to retry task')
  }
}

export default {
  createVideoTask,
  getVideoTasks,
  getVideoTask,
  updateVideoTask,
  deleteVideoTask,
  retryVideoTask
}
