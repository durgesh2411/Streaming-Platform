import express from 'express';

const app = express();
app.use(cors({
   origin: process.env.CORS_ORIGIN,
   credecials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

// good practice to use body-parser middleware:
app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended: true, limit: '16kb'}))
export { app };
