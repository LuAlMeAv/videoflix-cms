const mongoose = require('mongoose');
require('dotenv').config()

const { USER_DB, PASSWORD_DB, URL_DB } = process.env

const connectDB = () => {
    mongoose.connect(`mongodb://${USER_DB}:${PASSWORD_DB}@${URL_DB}/`)
        .then(() => console.log("DB conected!"))
        .catch((err) => console.error(err))
}

module.exports = connectDB;