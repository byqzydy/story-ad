/**
 * Video Task API Routes
 * 
 * Handles video task creation, status checking, and file serving
 */

import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { 
  createVideoTask, 
  getAllTasks, 
  getTaskById, 
  updateTask, 
  deleteTask,
  getVideoDirectory 
} from '../services/videoTaskStorage.js'
import { startPollingService, submitTask } from '../services/videoPollingService.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve video files
router.get('/videos/:taskId/:fileName', (req, res) => {
  const { taskId, fileName } = req.params
  const videoDir = getVideoDirectory()
  const filePath = path.join(videoDir, taskId, fileName)
  
  // Security: prevent path traversal
  if (!filePath.startsWith(videoDir)) {
    return res.status(403).json({ error: 'Invalid path' })
  }
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending video:', err)
      res.status(404).json({ error: 'Video not found' })
    }
  })
})

// Create a new video task
router.post('/create', async (req, res) => {
  try {
    const { 
      name,
      productName,
      productDescription,
      productImages,
      productLogo,
      movieName,
      movieType,
      duration,
      aspectRatio,
      script,
      clips
    } = req.body
    
    if (!name || !clips || clips.length === 0) {
      return res.status(400).json({ error: 'Name and clips are required' })
    }
    
    const task = createVideoTask({
      name,
      productName: productName || '',
      productDescription: productDescription || '',
      productImages: productImages || [],
      productLogo: productLogo || '',
      movieName: movieName || '',
      movieType: movieType || '',
      duration: duration || '30',
      aspectRatio: aspectRatio || '16:9',
      script: script || '',
      clips
    })
    
    console.log(`[API] Created video task: ${task.id}`)
    
    // Submit task to Dream API and start polling
    try {
      await submitTask(task.id)
    } catch (error) {
      console.error('[API] Error submitting task to Dream API:', error)
    }
    
    res.json({ success: true, task })
  } catch (error) {
    console.error('[API] Error creating video task:', error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create task' })
  }
})

// Get all video tasks
router.get('/list', (req, res) => {
  try {
    const tasks = getAllTasks()
    res.json({ success: true, tasks })
  } catch (error) {
    console.error('[API] Error listing tasks:', error)
    res.status(500).json({ error: 'Failed to list tasks' })
  }
})

// Get single task
router.get('/:taskId', (req, res) => {
  const { taskId } = req.params
  
  try {
    const task = getTaskById(taskId)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    
    // Convert local paths to URLs
    const taskWithUrls = {
      ...task,
      clips: task.clips.map(clip => ({
        ...clip,
        videoUrl: clip.localPath 
          ? `/api/video-tasks/videos/${clip.localPath}`
          : clip.videoUrl
      }))
    }
    
    res.json({ success: true, task: taskWithUrls })
  } catch (error) {
    console.error('[API] Error getting task:', error)
    res.status(500).json({ error: 'Failed to get task' })
  }
})

// Update task (e.g., retry failed clips)
router.patch('/:taskId', (req, res) => {
  const { taskId } = req.params
  const updates = req.body
  
  try {
    const task = updateTask(taskId, updates)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    
    res.json({ success: true, task })
  } catch (error) {
    console.error('[API] Error updating task:', error)
    res.status(500).json({ error: 'Failed to update task' })
  }
})

// Delete task
router.delete('/:taskId', (req, res) => {
  const { taskId } = req.params
  
  try {
    const success = deleteTask(taskId)
    if (!success) {
      return res.status(404).json({ error: 'Task not found' })
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('[API] Error deleting task:', error)
    res.status(500).json({ error: 'Failed to delete task' })
  }
})

// Retry failed clips
router.post('/:taskId/retry', async (req, res) => {
  const { taskId } = req.params
  
  try {
    const task = getTaskById(taskId)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    
    // Find failed clips and reset them
    const updatedClips = task.clips.map(clip => {
      if (clip.status === 'failed') {
        return { ...clip, status: 'pending', taskId: undefined, error: undefined }
      }
      return clip
    })
    
    updateTask(taskId, { 
      clips: updatedClips,
      status: 'processing'
    })
    
    // Submit failed clips again
    await submitTask(taskId)
    
    res.json({ success: true })
  } catch (error) {
    console.error('[API] Error retrying task:', error)
    res.status(500).json({ error: 'Failed to retry task' })
  }
})

// Initialize polling service on module load
startPollingService()

export default router
