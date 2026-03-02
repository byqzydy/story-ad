/**
 * Dream (即梦) Video Generation Service
 * 
 * Handles video generation using Dream AI API (即梦AI-视频生成3.0 Pro)
 * Now proxies through backend server to protect API keys
 * 
 * Features:
 * - Generate videos from text prompts (文生视频)
 * - Character consistency across multiple clips
 * - Scene splitting (max 15s per clip)
 */

import type { VideoClip } from './sceneSegmentation'
// Backend API configuration (proxied by Vite in development)
// In production, set VITE_API_URL to your production backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
// Video generation parameters
const VIDEO_ASPECT_RATIOS: Record<string, string> = {
  '16:9': '16:9',
  '9:16': '9:16',
  '1:1': '1:1',
  '4:3': '4:3',
  '3:4': '3:4',
  '21:9': '21:9'
}

// Frames mapping: 121 = 5s, 241 = 10s
const VIDEO_FRAMES: Record<number, number> = {
  5: 121,
  10: 241
}

export interface GenerateVideoParams {
  prompt: string
  aspectRatio: string
  duration?: number
  characterReference?: string
}

export interface VideoGenerationResult {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  videoUrl?: string
  thumbnailUrl?: string
  error?: string
}

export interface BatchVideoGenerationResult {
  clips: VideoGenerationResult[]
  overallStatus: 'pending' | 'processing' | 'completed' | 'partial' | 'failed'
  completedCount: number
  failedCount: number
}

/**
 * Generate a single video from prompt using Dream API (via backend proxy)
 */
export async function generateVideo(
  params: GenerateVideoParams
): Promise<VideoGenerationResult> {
  const { prompt, aspectRatio, duration = 5, characterReference } = params
  
  try {
    const response = await fetch(`${API_BASE_URL}/dream-video/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        aspectRatio,
        duration,
        characterReference
      })
    })
    
    const data = await response.json()
    console.log('Backend generate response:', data)
    
    if (data.success) {
      return {
        taskId: data.taskId,
        status: data.status
      }
    } else {
      return {
        taskId: '',
        status: 'failed',
        error: data.error || 'Failed to submit task'
      }
    }
  } catch (error) {
    console.error('Video generation submit failed:', error)
    return {
      taskId: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Poll for video generation status
 */
export async function getVideoStatus(taskId: string): Promise<VideoGenerationResult> {
  if (!taskId) {
    return {
      taskId: '',
      status: 'failed',
      error: 'No task ID provided'
    }
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/dream-video/status/${taskId}`)
    const data = await response.json()
    console.log('Backend status response:', data)
    
    if (data.success && data.status === 'completed') {
      return {
        taskId,
        status: 'completed',
        videoUrl: data.videoUrl
      }
    } else if (data.status === 'processing') {
      return {
        taskId,
        status: 'processing'
      }
    } else {
      return {
        taskId,
        status: 'failed',
        error: data.error || 'Task failed'
      }
    }
  } catch (error) {
    return {
      taskId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Status check failed'
    }
  }
}

/**
 * Generate videos with progress callback and polling
 */
export async function generateVideoWithProgress(
  clips: VideoClip[],
  characterDescriptions: Record<string, string>,
  onProgress: (current: number, total: number, result: VideoGenerationResult) => void
): Promise<BatchVideoGenerationResult> {
  const results: VideoGenerationResult[] = []
  let completedCount = 0
  let failedCount = 0
  
  const mainCharacterRef = Object.values(characterDescriptions)[0] || ''
  const total = clips.length
  
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i]
    
    try {
      // Submit the task
      const submitResult = await generateVideo({
        prompt: clip.prompt,
        aspectRatio: clip.aspectRatio,
        duration: clip.endTime - clip.startTime,
        characterReference: mainCharacterRef
      })
      
      if (submitResult.status === 'failed') {
        results.push(submitResult)
        failedCount++
        onProgress(i + 1, total, submitResult)
        continue
      }
      
      // Poll for status
      let finalResult = submitResult
      let pollCount = 0
      const maxPolls = 60 // Max 60 polls (about 2 minutes for 5s video)
      
      while (pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Poll every 2 seconds
        
        const statusResult = await getVideoStatus(submitResult.taskId)
        
        if (statusResult.status === 'completed') {
          finalResult = statusResult
          completedCount++
          break
        } else if (statusResult.status === 'failed') {
          finalResult = statusResult
          failedCount++
          break
        }
        
        pollCount++
        console.log(`Polling clip ${i + 1}/${total}: ${pollCount}/${maxPolls}, status: ${statusResult.status}`)
      }
      
      results.push(finalResult)
      onProgress(i + 1, total, finalResult)
    } catch (error) {
      const errorResult: VideoGenerationResult = {
        taskId: clip.id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Generation failed'
      }
      results.push(errorResult)
      failedCount++
      onProgress(i + 1, total, errorResult)
    }
    
    // Delay between submissions
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return {
    clips: results,
    overallStatus: failedCount === 0 ? 'completed' : failedCount < total ? 'partial' : 'failed',
    completedCount,
    failedCount
  }
}

/**
 * Mock function for demo/testing without real API
 */
export async function generateVideoMock(
  params: GenerateVideoParams
): Promise<VideoGenerationResult> {
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return {
    taskId: `mock_${Date.now()}`,
    status: 'completed',
    videoUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/demo/320/180'
  }
}

/**
 * Mock batch generation for demo
 */
export async function generateVideoBatchMock(
  clips: VideoClip[],
  characterDescriptions: Record<string, string> = {}
): Promise<BatchVideoGenerationResult> {
  const results: VideoGenerationResult[] = []
  
  for (let i = 0; i < clips.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    results.push({
      taskId: `mock_clip_${i}`,
      status: 'completed',
      videoUrl: `https://sample-videos.com/video${i}/mp4/720/big_buck_bunny_720p_1mb.mp4`,
      thumbnailUrl: `https://picsum.photos/seed/clip${i}/320/180`
    })
  }
  
  return {
    clips: results,
    overallStatus: 'completed',
    completedCount: clips.length,
    failedCount: 0
  }
}
