import 'dotenv/config';
import express from 'express';
import corsMiddleware from './config/cors.js';
import sessionMiddleware from './config/session.js';
import './config/database.js';
import routes from './routes/index.js';

const app = express();
const port = Number(process.env.PORT) || 5000;

// Cấu hình middleware tập trung
app.use(corsMiddleware);
app.use(express.json());
app.use(sessionMiddleware);

// Toàn bộ logic định tuyến giao phó cho routes/index.js
app.use('/api', routes);
app.use('/', routes);

app.listen(port, () => {
  console.log(`Minh Duc Service API listening on port ${port}`);
});
