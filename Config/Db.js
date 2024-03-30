const moongoose = require('mongoose')

exports.ConnectDatabase = async()=>{
    try {
        await moongoose.connect(process.env.MONGOURL)
        console.log("Database is Connecting Successfull");
    } catch (error) {
        console.log(` Error In Database Connection ${error}`)
    }
}