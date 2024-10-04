const mongoose = require("mongoose");
const config = require("config");
const debug = require("debug")('development:mongoose');

const connectDB = mongoose.connect(`${config.get("MONGODB_URI")}/INSTAGRAM`)
.then(()=>{
    debug("Database connected successfully")
}).catch((err)=>{
    console.log("Database connection failed: " + err.message)
})

module.exports = connectDB;
