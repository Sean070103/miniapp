import { createServer } from 'http'
import { parse } from 'url'
import { StringDecoder } from 'string_decoder'
import crypto from 'crypto'
import type { IncomingMessage, ServerResponse } from 'http'
import type { AddressInfo } from 'net'
import type { } from './lib/socket-server'
import { initSocketServer } from './lib/socket-server'

const port = parseInt(process.env.PORT || '8080', 10)
const forwardSecret = process.env.SOCKET_FORWARD_SECRET || ''

function readJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const decoder = new StringDecoder('utf-8')
    let buffer = ''
    req.on('data', (data) => {
      buffer += decoder.write(data)
    })
    req.on('end', () => {
      buffer += decoder.end()
      try {
        const json = buffer ? JSON.parse(buffer) : {}
        resolve(json)
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = parse(req.url || '/', true)

  // Health
  if (req.method === 'GET' && url.pathname === '/health') {
    res.statusCode = 200
    res.end('ok')
    return
  }

  // Receive forward notification: POST /notify
  if (req.method === 'POST' && url.pathname === '/notify') {
    if (!forwardSecret) {
      res.statusCode = 500
      res.end('server not configured')
      return
    }
    const auth = req.headers['authorization'] || ''
    const token = Array.isArray(auth) ? auth[0] : auth
    if (!token.startsWith('Bearer ') || token.slice(7) !== forwardSecret) {
      res.statusCode = 401
      res.end('unauthorized')
      return
    }
    try {
      const body = await readJsonBody(req)
      const { userId, notification } = body || {}
      if (!userId || !notification) {
        res.statusCode = 400
        res.end('missing fields')
        return
      }
      const io = (global as any).io
      io.to(`user:${userId}`).emit('notification', notification)
      res.statusCode = 200
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ ok: true }))
      return
    } catch (e: any) {
      res.statusCode = 500
      res.end('error')
      return
    }
  }

  res.statusCode = 404
  res.end('not found')
})

const io = initSocketServer(server)
;(global as any).io = io

server.listen(port, () => {
  console.log(`Socket server listening on :${port}`)
})


