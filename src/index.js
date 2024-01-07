const express = require('express')
const cors = require('cors')
const connectDB = require('./dbConection')

const port = process.env.PORT || 5000

const app = express()

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Great! the backend API is working')
})
app.use(require('./router/filesManager.routes'))
app.use(require('./router/database.routes'))

app.all('*', (req, res) => {
    res.status(404).json('WOW! no hay nada por aquí')
})

app.listen(port, () => {
    console.log("App running on port: " + port)
    connectDB();
})