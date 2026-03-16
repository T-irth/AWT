const express = require('express')
const app = express()
const productRoutes = require('./src/routes/product.route.js')
const port = 3000
// middleware 
app.use(express.json())
app.use('/products', productRoutes)
app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))