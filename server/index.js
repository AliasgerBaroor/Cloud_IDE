const express = require('express')
const cors = require("cors")
const routes = require("./routes/Routes")
const app = express()

app.use(cors())
app.use(express.json())

app.use(routes)

const PORT = process.env.PORTNM || 8000
app.listen(PORT, () => console.log(`user container started on port: http://localhost:${PORT}`))