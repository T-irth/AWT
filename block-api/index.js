const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000
app.use(express.json())
mongoose.connect(process.env.MONGOdb)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('problem in  connection', err))

app.use("/auth", require('./routes/authRoutes'))
app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))