require('dotenv').config("../");
const mongoose = require('mongoose');


const {DB_USERNAME, DB_PASSWORD, DB_DATABASE} = process.env
const connectionSrt = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@cluster0.wvfmfrm.mongodb.net/${DB_DATABASE}`

mongoose.connect(connectionSrt)

mongoose.connection.on("connected", ()=>{
    console.log("connected")
})

mongoose.connection.on("error", (err)=>{
    console.log(err);
})

