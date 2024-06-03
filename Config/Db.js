const mongoose = require('mongoose')

exports.ConnectDatabase = async()=>{
    try {
        await mongoose.connect(process.env.MONGOURL)
        console.log("Database is Connecting Successful");
    } catch (error) {
        console.log(` Error In Database Connection ${error}`)
    }
}