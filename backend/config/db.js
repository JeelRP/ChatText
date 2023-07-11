const mongoose = require("mongoose");


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            usenewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log(`MongoDb Connected : ${conn.connection.host}`)
    } catch (error) {
        console.log(`Error: ${error.message}`)
        process.exit()
    }
}

module.exports = connectDB;


// mongoose.connect(process.env.MONGO_URI, {
//   usenewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//     console.log("database is connected")
// }).catch((err) => {
//     console.log(err)
// })
