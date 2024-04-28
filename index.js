import express from 'express'

import { config } from 'dotenv'
import path from 'path'
import { initiatApp } from './src/utils/initiatApp.js'
config({ path: path.resolve('./config/config.env') })


const app = express()
const port = process.env.PORT || 5000

initiatApp(app, express)

// const httpServer = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// const io = new Server(httpServer, {
//     cors: '*'
// })
// io.on('connection', (socket) => {
//     console.log({ socketId: socket.id });

//     socket.emit('backtofront', 'Hello From back')
// })



