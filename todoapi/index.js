const express = require('express')
const app = express()
const productRoute = require("./src/routes/product.routes")
const port = 3000
const error = require("./src/utils/error")



app.use(express.json())
app.use(error.errorHandler)
app.use('/product', productRoute);
app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))