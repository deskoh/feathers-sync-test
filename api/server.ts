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
  date: Date
}

class MessageService {
  messages: Message[] = []

  async find () {
    // Just return all our messages
    return this.messages
  }



  async create (data: Pick<Message, 'text' | 'date'>) {
    const message: Message = {
      id: this.messages.length,
      text: data.text,
      date: data.date,
    }
    console.log(`Creating message ${message.id} on ${port}`)
    this.messages.push(message)
    return message
  }
}

const app = express(feathers())

// Configure Redis
app.configure(sync({
  // uri: 'redis://localhost:6379'
  uri: 'amqp://guest:guest@localhost:5672',
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


app.service('messages').on('created', (data: Message) => {
  console.log(`Server ${port}: ${data.text}`)
})

// Start the server
app.listen(port).on('listening', () =>
  console.log(`Feathers server listening on localhost:${port}`)
)
