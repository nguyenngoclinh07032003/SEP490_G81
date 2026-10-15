import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import healthRoutes from './routes/health.routes.js';

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());
app.use('/api', healthRoutes);

app.listen(port, () => {
  console.log(`HRMSS API listening on port ${port}`);
});
