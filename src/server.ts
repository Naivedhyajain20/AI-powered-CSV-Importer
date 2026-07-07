import express from 'express';
import cors from 'cors';
import importRoutes from './routes/import.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Root health check route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'CSV Importer API' });
});

// Routes mount
app.use('/api/v1/imports', importRoutes);

// Catch-all Error Handling Middleware
app.use(errorHandler);

export default app;
