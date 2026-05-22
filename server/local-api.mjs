import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { handleGenerateSpecRequest } from './spec-engine.mjs'

loadEnv()

const port = Number(process.env.API_PORT ?? 8787)

const server = createServer(async (request, response) => {
  setCorsHeaders(response)

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  if (request.url !== '/api/generate-spec' || request.method !== 'POST') {
    sendJson(response, 404, { error: 'Not found' })
    return
  }

  try {
    const body = await readJsonBody(request)
    const result = await handleGenerateSpecRequest(body, {
      ipAddress: request.socket.remoteAddress,
    })

    sendJson(response, result.statusCode, result.payload)
  } catch (error) {
    sendJson(response, error.statusCode ?? 500, {
      error: error instanceof Error ? error.message : 'Generation failed.',
    })
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Local API listening on http://127.0.0.1:${port}`)
})

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env')

  try {
    const content = readFileSync(envPath, 'utf8')

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('#')) continue

      const separatorIndex = trimmed.indexOf('=')
      if (separatorIndex === -1) continue

      const key = trimmed.slice(0, separatorIndex).trim()
      const rawValue = trimmed.slice(separatorIndex + 1).trim()
      const value = rawValue.replace(/^["']|["']$/g, '')

      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env is optional so the API can return a clear runtime error.
  }
}

function setCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5173')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(payload))
}

async function readJsonBody(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  const rawBody = Buffer.concat(chunks).toString('utf8')
  return rawBody ? JSON.parse(rawBody) : {}
}
