import express, { NextFunction, Request, Response } from 'express';
import { resolve } from 'path';
import cors from 'cors';
import routes from './routes';
import 'express-async-errors';

const app = express();
app.use(cors());
app.use(express.json());

app.use(routes);
app.use('/uploads', express.static(resolve(__dirname, '..', 'uploads')));

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  return response.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});
app.listen(3333, () => {
  // eslint-disable-next-line no-console
  console.log('🚀Server started on port 3333');
});
