import io  from 'socket.io-client'
import feathers  from '@feathersjs/feathers'
import socketio  from '@feathersjs/socketio-client'

function initClient(host: string) {
  console.log(`Connecting to ${host}`)
  const socket = io(host, {
    transports: ['websocket'],
  })
  const client = feathers()

  client.configure(socketio(socket))

  const messageService = client.service('messages')

  messageService.on('created', (message: string) => console.log('Created a message ', message))

  // Use the messages service from the server
  messageService.create({
    text: `Message from client ${host}`
  })
}

const url = new URL(window.location.href)
const port = url.searchParams.get('port') || '3030'
initClient(`http://localhost:${port}`)
