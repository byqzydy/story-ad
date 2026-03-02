/**
 * Video Task Storage Service
 * 
 * Handles storage and management of video generation tasks
 * Uses JSON file storage for persistence
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Data directory
const DATA_DIR = path.join(__dirname, '..', 'data')
const TASKS_FILE = path.join(DATA_DIR, 'video-tasks.json')

// Video storage directory
const VIDEO_DIR = path.join(__dirname, '..', 'videos')

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(VIDEO_DIR)) {
    fs.mkdirSync(VIDEO_DIR, { recursive: true })
  }
}

// Load tasks from file
function loadTasks() {
  ensureDirectories()
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading video tasks:', error)
  }
  return []
}

// Save tasks to file
function saveTasks(tasks) {
  ensureDirectories()
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2))
}

// Create a new video task
function createVideoTask(taskData) {
  const tasks = loadTasks()
  
  const newTask = {
    ...taskData,
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clips: taskData.clips || []
  }
  
  tasks.push(newTask)
  saveTasks(tasks)
  
  console.log(`[VideoTask] Created new task: ${newTask.id}`)
  return newTask
}

// Get all tasks
function getAllTasks() {
  return loadTasks()
}

// Get task by ID
function getTaskById(id) {
  const tasks = loadTasks()
  return tasks.find(t => t.id === id) || null
}

// Update task
function updateTask(id, updates) {
  const tasks = loadTasks()
  const index = tasks.findIndex(t => t.id === id)
  
  if (index === -1) return null
  
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  saveTasks(tasks)
  return tasks[index]
}

// Delete task
function deleteTask(id) {
  const tasks = loadTasks()
  const filtered = tasks.filter(t => t.id !== id)
  
  if (filtered.length === tasks.length) return false
  
  // Delete associated video files
  const task = tasks.find(t => t.id === id)
  if (task) {
    task.clips.forEach(clip => {
      if (clip.localPath) {
        const fullPath = path.join(VIDEO_DIR, clip.localPath)
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath)
        }
      }
    })
  }
  
  saveTasks(filtered)
  return true
}

// Get video storage directory
function getVideoDirectory() {
  ensureDirectories()
  return VIDEO_DIR
}

// Save video file from URL
async function saveVideoFromUrl(videoUrl, taskId, clipIndex) {
  ensureDirectories()
  
  try {
    // Create task folder
    const taskFolder = path.join(VIDEO_DIR, taskId)
    if (!fs.existsSync(taskFolder)) {
      fs.mkdirSync(taskFolder, { recursive: true })
    }
    
    const fileName = `clip_${clipIndex}_${Date.now()}.mp4`
    const filePath = path.join(taskFolder, fileName)
    
    // Download video
    const response = await fetch(videoUrl)
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status}`)
    }
    
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(filePath, Buffer.from(buffer))
    
    console.log(`[VideoTask] Saved video: ${filePath}`)
    return `${taskId}/${fileName}`
  } catch (error) {
    console.error('[VideoTask] Error saving video:', error)
    return null
  }
}

// Get pending tasks for polling
function getPendingTasks() {
  const tasks = loadTasks()
  return tasks.filter(t => t.status === 'processing' || t.clips.some(c => c.status === 'processing'))
}

// Export for use in routes
export default {
  createVideoTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getVideoDirectory,
  saveVideoFromUrl,
  getPendingTasks
}

export {
  createVideoTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getVideoDirectory,
  saveVideoFromUrl,
  getPendingTasks
}
