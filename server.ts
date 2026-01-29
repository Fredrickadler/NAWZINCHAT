import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { prisma } from './lib/prisma'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

  io.use(async (socket, next) => {
    try {
      // Try to get token from auth object first, then from cookies
      let token = socket.handshake.auth.token
      
      if (!token) {
        // Try to get from cookies in the handshake
        const cookieHeader = socket.handshake.headers.cookie
        if (cookieHeader) {
          const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=')
            acc[key] = value
            return acc
          }, {} as Record<string, string>)
          token = cookies.token
        }
      }
      
      if (!token) {
        return next(new Error('Authentication error'))
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string }
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      })

      if (!user) {
        return next(new Error('User not found'))
      }

      socket.data.userId = user.id
      socket.data.username = user.username
      
      // Join room for user ID for targeted messaging
      socket.join(user.id)
      
      next()
    } catch (err) {
      console.error('Socket auth error:', err)
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.username}`)

    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, message } = data

        // Verify user is a member of the chat
        const membership = await prisma.chatMember.findFirst({
          where: {
            chatId,
            userId: socket.data.userId,
          },
        })

        if (!membership) {
          socket.emit('error', { message: 'Access denied' })
          return
        }

        // Get chat members
        const chatMembers = await prisma.chatMember.findMany({
          where: { chatId },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        })

        // Emit to all members of the chat
        chatMembers.forEach((member) => {
          io.to(member.userId).emit('newMessage', {
            ...message,
            chatId,
            sender: {
              id: message.sender.id,
              username: message.sender.username,
              avatar: message.sender.avatar,
            },
          })
        })
      } catch (error) {
        console.error('Error handling sendMessage:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.username}`)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})

