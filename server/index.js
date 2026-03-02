/**
 * Backend Server - Story Ad Platform
 * 
 * Proxies API requests to external services to protect API keys
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import dreamVideoRouter from './routes/dreamVideo.js'
import videoTasksRouter from './routes/videoTasks.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/dream-video', dreamVideoRouter)
app.use('/api/video-tasks', videoTasksRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error', message: err.message })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 Frontend should connect to: http://localhost:${PORT}/api`)
})

export default app
