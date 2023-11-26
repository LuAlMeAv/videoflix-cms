const express = require('express')
const cors = require('cors')
const connectDB = require('./dbConection')

const port = process.env.PORT || 5000

const app = express()

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World')
})
app.use(require('./router/upload.routes'))
app.use(require('./router/movieDB.routes'))

app.get('*', (req, res) => {
    res.send('404 not found')
})

app.listen(port, () => {
    console.log("App running on port: " + port)
    connectDB();
})

