/**
 * Dream Video API Routes
 * 
 * Proxies video generation requests to Dream (即梦) AI API
 * Uses Volcengine AK/SK signature authentication
 */

import express from 'express'
import crypto from 'crypto'

const router = express.Router()

// Dream API configuration
const DREAM_API_BASE_URL = 'https://visual.volcengineapi.com'
const DREAM_API_VERSION = '2022-08-31'

// Video parameters
const VIDEO_ASPECT_RATIOS = {
  '16:9': '16:9',
  '9:16': '9:16',
  '1:1': '1:1',
  '4:3': '4:3',
  '3:4': '3:4',
  '21:9': '21:9'
}

const VIDEO_FRAMES = {
  5: 121,
  10: 241
}

/**
 * Generate Volcengine API signature
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} path - API path
 * @param {string} queryString - Query string
 * @param {string} body - Request body
 * @param {string} accessKey - Access Key ID
 * @param {string} secretKey - Secret Access Key
 * @returns {string} - Authorization header value
 */
function generateVolcengineSignature(method, path, queryString, body, accessKey, secretKey) {
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const shortTimestamp = timestamp.slice(0, 10).replace(/-/g, '')
  
  // 1. Hash the request body
  const hashedBody = crypto.createHash('sha256').update(body || '').digest('hex')
  
  // 2. Construct canonical request
  const canonicalHeaders = `content-type:application/json\nhost:visual.volcengineapi.com\nx-date:${timestamp}\n`
  const signedHeaders = 'content-type;host;x-date'
  const canonicalRequest = [
    method,
    path,
    queryString,
    canonicalHeaders,
    signedHeaders,
    hashedBody
  ].join('\n')
  
  // 3. String to sign
  const algorithm = 'HMAC-SHA256'
  const credentialScope = `${shortTimestamp}/request`
  const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  const stringToSign = [
    algorithm,
    timestamp,
    credentialScope,
    hashedCanonicalRequest
  ].join('\n')
  
  // 4. Calculate signature
  const kDate = crypto.createHmac('sha256', secretKey).update(shortTimestamp).digest()
  const kRegion = crypto.createHmac('sha256', kDate).update('cn-north-1').digest()
  const kService = crypto.createHmac('sha256', kRegion).update('cv').digest()
  const kSigning = crypto.createHmac('sha256', kService).update('request').digest()
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex')
  
  // 5. Build authorization header
  const credential = `${accessKey}/${credentialScope}`
  return `${algorithm} Credential=${credential}, SignedHeaders=${signedHeaders}, Signature=${signature}`
}

/**
 * Make authenticated request to Volcengine API
 */
async function volcengineRequest(method, action, payload) {
  const accessKey = process.env.VOLCENGINE_ACCESS_KEY_ID
  const secretKey = process.env.VOLCENGINE_SECRET_ACCESS_KEY
  
  if (!accessKey || !secretKey) {
    throw new Error('Volcengine AK/SK not configured')
  }
  
  const path = '/'
  const queryString = `Action=${action}&Version=${DREAM_API_VERSION}`
  const body = JSON.stringify(payload)
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  
  const authorization = generateVolcengineSignature(
    method,
    path,
    queryString,
    body,
    accessKey,
    secretKey
  )
  
  const response = await fetch(
    `${DREAM_API_BASE_URL}?${queryString}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': 'visual.volcengineapi.com',
        'X-Date': timestamp,
        'Authorization': authorization
      },
      body: body
    }
  )
  
  return response.json()
}

// Submit video generation task
router.post('/generate', async (req, res) => {
  const { prompt, aspectRatio, duration = 5, characterReference } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  // Build prompt with character reference for consistency
  let fullPrompt = prompt
  if (characterReference) {
    fullPrompt = `[人物描写: ${characterReference}]\n${prompt}`
  }

  const payload = {
    req_key: 'jimeng_ti2v_v30_pro',
    prompt: fullPrompt,
    seed: -1,
    frames: VIDEO_FRAMES[duration] || VIDEO_FRAMES[5],
    aspect_ratio: VIDEO_ASPECT_RATIOS[aspectRatio] || '16:9'
  }

  try {
    console.log('=== Dream API Request ===')
    console.log('Payload:', JSON.stringify(payload))
    
    const data = await volcengineRequest('POST', 'CVSync2AsyncSubmitTask', payload)
    
    console.log('=== Dream API Response ===')
    console.log('Status:', data.code)
    console.log('Response:', JSON.stringify(data))
    console.log('=========================')

    if (data.code === 10000 && data.data?.task_id) {
      res.json({
        success: true,
        taskId: data.data.task_id,
        status: 'pending'
      })
    } else {
      res.status(400).json({
        success: false,
        error: data.message || 'Failed to submit task',
        code: data.code
      })
    }
  } catch (error) {
    console.error('Video generation submit failed:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get video generation status
router.get('/status/:taskId', async (req, res) => {
  const { taskId } = req.params

  if (!taskId) {
    return res.status(400).json({ error: 'Task ID is required' })
  }

  const payload = {
    req_key: 'jimeng_ti2v_v30_pro',
    task_id: taskId
  }

  try {
    const data = await volcengineRequest('POST', 'CVSync2AsyncGetResult', payload)
    
    console.log('Dream API status response:', data)

    if (data.code === 10000 && data.data?.status === 'done') {
      res.json({
        success: true,
        taskId,
        status: 'completed',
        videoUrl: data.data.video_url
      })
    } else if (data.data?.status === 'generating' || data.data?.status === 'in_queue') {
      res.json({
        success: true,
        taskId,
        status: 'processing'
      })
    } else {
      res.json({
        success: false,
        taskId,
        status: 'failed',
        error: data.message || 'Task failed'
      })
    }
  } catch (error) {
    console.error('Status check failed:', error)
    res.status(500).json({
      success: false,
      taskId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Status check failed'
    })
  }
})

export default router
