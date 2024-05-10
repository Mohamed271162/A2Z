import { connectionDB } from "../../DB/connection.js"
import { globalResponse } from "./errorhandling.js"
import * as routers from '../modules/index.routes.js'
import cors from 'cors'
import { Server } from "socket.io"


// import middleware from '../middlewares/firebase.middleware.js'

export const initiatApp = (app,express)=>{
const port = process.env.PORT || 5000
app.use( express.json())
app.use(express.urlencoded({extended:true}))
connectionDB()
app.use(cors())

app.get('/', (req, res) => res.send('Hello World!'))
// app.use(middleware.decodeToken)
app.use('/engineer',routers.engineerRouter)
app.use('/admin',routers.adminRouter)
app.use('/user',routers.userRouter)
app.use('/category',routers.categoryRoute)



app.all('*', (req, res, next) =>
res.status(404).json({ message: '404 Not Found URL' }),
)

app.use(globalResponse)

const httpServer = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

const io = new Server(httpServer, {
    cors: '*'
})
io.on('connection', (socket) => {
    console.log({ socketId: socket.id });

    socket.emit('backtofront', 'Hello From back')
})

}