import { handleGenerateSpecRequest } from '../server/spec-engine.mjs'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const result = await handleGenerateSpecRequest(normalizeBody(request.body), {
      ipAddress: getClientIp(request),
    })

    response.status(result.statusCode).json(result.payload)
  } catch (error) {
    response.status(error.statusCode ?? 500).json({
      error: error instanceof Error ? error.message : 'Generation failed.',
    })
  }
}

function normalizeBody(body) {
  if (typeof body === 'string') {
    return body ? JSON.parse(body) : {}
  }

  return body ?? {}
}

function getClientIp(request) {
  const forwardedFor = request.headers['x-forwarded-for']

  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim()
  }

  return request.socket?.remoteAddress ?? 'anonymous'
}
