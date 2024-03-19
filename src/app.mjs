import express from "express";
import { config } from "dotenv";
const app = express()
config()
app.use(express.json())

app.get('/api/v1/status', (req, res) => {
    res.sendStatus(200)
})


app.listen(process.env.PORT, () => {
    console.log('Listening on port: ' + process.env.PORT)
})