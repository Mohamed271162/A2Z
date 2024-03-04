import { connectionDB } from "../../DB/connection.js"
import { globalResponse } from "./errorhandling.js"
import * as routers from '../modules/index.routes.js'
import  urlencoded  from "express"
import cors from 'cors'
import compression from "compression"
// import middleware from '../middlewares/firebase.middleware.js'

export const initiatApp = (app,express)=>{
const port = process.env.PORT
app.use( express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())
app.use(compression())
connectionDB()

// app.use(middleware.decodeToken)
app.use('/engineer',routers.engineerRouter)
app.use('/admin',routers.adminRouter)
app.use(routers.adminRouter)



app.all('*', (req, res, next) =>
res.status(404).json({ message: '404 Not Found URL' }),
)

app.use(globalResponse)
app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

}