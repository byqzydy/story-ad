/**
 * Video Task Polling Service
 * 
 * Periodically checks video generation status from Dream API
 * Downloads completed videos and updates task status
 */

import { getTaskById, updateTask, saveVideoFromUrl, getPendingTasks } from './videoTaskStorage.js'
import { volcengineRequest } from '../routes/dreamVideo.js'

const POLL_INTERVAL = 60000 // 1 minute
let pollingInterval = null

/**
 * Check status of a single clip
 */
async function checkClipStatus(taskId, clipIndex) {
  const task = getTaskById(taskId)
  if (!task || !task.clips[clipIndex]) {
    return { status: 'failed', error: 'Task or clip not found' }
  }
  
  const clip = task.clips[clipIndex]
  if (!clip.taskId) {
    return { status: 'failed', error: 'No task ID for this clip' }
  }
  
  try {
    const payload = {
      req_key: 'jimeng_ti2v_v30_pro',
      task_id: clip.taskId
    }
    
    const data = await volcengineRequest('POST', 'CVSync2AsyncGetResult', payload)
    
    if (data.code === 10000) {
      if (data.data?.status === 'done') {
        return { status: 'completed', videoUrl: data.data.video_url }
      } else if (data.data?.status === 'generating' || data.data?.status === 'in_queue') {
        return { status: 'processing' }
      }
    }
    
    return { status: 'failed', error: data.message || 'Unknown status' }
  } catch (error) {
    return { status: 'failed', error: error.message || 'Check failed' }
  }
}

/**
 * Process a single task - check all clips
 */
async function processTask(taskId) {
  console.log(`[Polling] Processing task: ${taskId}`)
  
  const task = getTaskById(taskId)
  if (!task) {
    console.log(`[Polling] Task not found: ${taskId}`)
    return
  }
  
  let hasProcessing = false
  let allCompleted = true
  let completedCount = 0
  
  for (let i = 0; i < task.clips.length; i++) {
    const clip = task.clips[i]
    
    if (clip.status === 'completed' || clip.status === 'failed') {
      if (clip.status === 'completed') completedCount++
      else allCompleted = false
      continue
    }
    
    hasProcessing = true
    
    if (clip.status === 'pending') {
      updateTask(taskId, {
        clips: task.clips.map((c, idx) => 
          idx === i ? { ...c, status: 'processing' } : c
        )
      })
    }
    
    const result = await checkClipStatus(taskId, i)
    
    if (result.status === 'completed' && result.videoUrl) {
      console.log(`[Polling] Clip ${i} completed, downloading...`)
      const localPath = await saveVideoFromUrl(result.videoUrl, taskId, i)
      
      if (localPath) {
        updateTask(taskId, {
          clips: task.clips.map((c, idx) => 
            idx === i ? { 
              ...c, 
              status: 'completed', 
              videoUrl: result.videoUrl,
              localPath: localPath
            } : c
          )
        })
        completedCount++
        console.log(`[Polling] Clip ${i} saved to: ${localPath}`)
      } else {
        updateTask(taskId, {
          clips: task.clips.map((c, idx) => 
            idx === i ? { 
              ...c, 
              status: 'failed', 
              error: 'Failed to download video'
            } : c
          )
        })
        allCompleted = false
      }
    } else if (result.status === 'processing') {
      console.log(`[Polling] Clip ${i} still processing`)
    } else {
      updateTask(taskId, {
        clips: task.clips.map((c, idx) => 
          idx === i ? { 
            ...c, 
            status: 'failed', 
            error: result.error || 'Generation failed'
          } : c
        )
      })
      allCompleted = false
      console.log(`[Polling] Clip ${i} failed: ${result.error}`)
    }
  }
  
  const updatedTask = getTaskById(taskId)
  if (updatedTask) {
    if (allCompleted && completedCount === task.clips.length) {
      updateTask(taskId, { status: 'completed' })
      console.log(`[Polling] Task ${taskId} completed!`)
    } else if (hasProcessing) {
      console.log(`[Polling] Task ${taskId} still processing...`)
    } else {
      updateTask(taskId, { status: 'failed' })
      console.log(`[Polling] Task ${taskId} failed`)
    }
  }
}

async function pollingLoop() {
  try {
    const pendingTasks = getPendingTasks()
    
    if (pendingTasks.length > 0) {
      console.log(`[Polling] Found ${pendingTasks.length} pending tasks`)
      
      for (const task of pendingTasks) {
        await processTask(task.id)
      }
    }
  } catch (error) {
    console.error('[Polling] Error in polling loop:', error)
  }
}

function startPollingService() {
  if (pollingInterval) {
    console.log('[Polling] Polling service already running')
    return
  }
  
  console.log(`[Polling] Starting polling service (interval: ${POLL_INTERVAL}ms)`)
  
  pollingLoop()
  
  pollingInterval = setInterval(pollingLoop, POLL_INTERVAL)
}

function stopPollingService() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
    console.log('[Polling] Polling service stopped')
  }
}

async function submitTask(taskId) {
  const task = getTaskById(taskId)
  if (!task) {
    throw new Error('Task not found')
  }
  
  updateTask(taskId, { status: 'processing' })
  
  for (let i = 0; i < task.clips.length; i++) {
    const clip = task.clips[i]
    
    try {
      const payload = {
        req_key: 'jimeng_ti2v_v30_pro',
        prompt: clip.prompt,
        seed: -1,
        frames: 121,
        aspect_ratio: task.aspectRatio || '16:9'
      }
      
      const data = await volcengineRequest('POST', 'CVSync2AsyncSubmitTask', payload)
      
      if (data.code === 10000 && data.data?.task_id) {
        const currentClips = task.clips.map((c, idx) => 
          idx === i ? { ...c, taskId: data.data.task_id, status: 'processing' } : c
        )
        updateTask(taskId, { clips: currentClips })
        console.log(`[Polling] Submitted clip ${i}, taskId: ${data.data.task_id}`)
      } else {
        const currentClips = task.clips.map((c, idx) => 
          idx === i ? { ...c, status: 'failed', error: data.message || 'Submit failed' } : c
        )
        updateTask(taskId, { clips: currentClips })
        console.error(`[Polling] Failed to submit clip ${i}:`, data)
      }
    } catch (error) {
      console.error(`[Polling] Error submitting clip ${i}:`, error)
      const currentClips = task.clips.map((c, idx) => 
        idx === i ? { ...c, status: 'failed', error: error.message || 'Submit error' } : c
      )
      updateTask(taskId, { clips: currentClips })
    }
  }
}

export default {
  startPollingService,
  stopPollingService,
  submitTask,
  processTask
}
