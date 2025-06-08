import express from 'express';
import identifyRouter from './routes/route';

const app = express();

app.use(express.json());
app.use('/identify', identifyRouter);




export default app;
