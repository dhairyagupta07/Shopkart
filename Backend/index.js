import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import userRoutes from "./routes/customer.routes.js"
import cookieParser from 'cookie-parser'
import cors from 'cors'

dotenv.config();

const app = express();

mongoose.connect(process.env.dbURL).then(()=>{
    console.log('DB connected')
}).catch((err)=>{
    console.log(err);
})

const PORT = process.env.PORT || 8000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())
app.use('/customers', userRoutes)
app.listen(PORT, ()=> {
    console.log(`Server started on port ${PORT}`);
});

