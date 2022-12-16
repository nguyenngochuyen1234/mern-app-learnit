require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const authRouter = require('./routes/auth')
const postRouter = require('./routes/post')

const connectDB = async () => {
    try {
        await mongoose.connect(
            `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@atlascluster.83tbcsh.mongodb.net/?retryWrites=true&w=majority`,
            // `mongodb+srv://huyen4:4122003@atlascluster.83tbcsh.mongodb.net/?retryWrites=true&w=majority`,
            {
                // useCreateIndex: true,
                // useNewUrlPhaser: true,
                useUniFiedTopology: true,
                // useFindAndModify: false
            }
        )
        console.log('MongoDB connected')
    } catch (err) {
        console.log(err.message)
        process.exit(1)
    }
}
mongoose.set('strictQuery', true)

connectDB()
const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)

app.get('/', (req, res) => res.send('Hello world'))

const PORT = 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))