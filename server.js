const express = require('express')
const app = express()
const cors = require('cors')
const dotenv= require('dotenv')
const CookkieParser= require('cookie-parser')

const UserRoutes = require('./routes/useroutes')
const { ConnectDatabase } = require('./Config/Db')
//config Dotenv
dotenv.config()
const Port = process.env.PORT
// Database Calling
ConnectDatabase()
            

const options = {
    credentials: true};
// middlware
app.use(cors(options))
app.use(express.json())
app.use(CookkieParser())



app.use(express.urlencoded({extended:true}))

//Routes
app.get('/',(req,res)=>{
    res.send('I Am From Lottery Backend')
})
//dynamcic routes
app.use('/api/v1',UserRoutes)


//Listen App

app.listen(Port,()=>{
    console.log(`Server is Running is Port ${Port}`)
})