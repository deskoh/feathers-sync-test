/// <reference path="./declaration.d.ts" />
import feathers from '@feathersjs/feathers'
import '@feathersjs/transport-commons'
import express from '@feathersjs/express'
import socketio from '@feathersjs/socketio'
import sync from 'feathers-sync'

const port = parseInt(process.argv[2]) || 3030;

interface Message {
  id: number
  text: string
}

class MessageService {
  messages: Message[] = []

  async find () {
    // Just return all our messages
    return this.messages
  }

  async create (data: Pick<Message, 'text'>) {
    const message: Message = {
      id: this.messages.length,
      text: data.text
    }
    console.log(`Creating message ${message.id} on ${port}`)
    this.messages.push(message)
    return message
  }
}

const app = express(feathers())

// Configure Redis
app.configure(sync({
  uri: 'redis://localhost:6379'
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.configure(express.rest())
app.configure(socketio())
app.use('/messages', new MessageService())
app.use(express.errorHandler())

app.on('connection', connection =>
  app.channel('everybody').join(connection)
)
app.publish(data => app.channel('everybody'))

// Start the server
app.listen(port).on('listening', () =>
  console.log(`Feathers server listening on localhost:${port}`)
)
