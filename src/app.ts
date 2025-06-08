import express from 'express';
import identifyRouter from './routes/route';

const app = express();

app.use(express.json());
app.use('/identify', identifyRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy 🚀' });
});


export default app;
