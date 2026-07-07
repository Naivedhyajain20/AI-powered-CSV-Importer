import app from './server';
import { env } from './config/env';
import pino from 'pino';

const logger = pino();

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(
    { port: PORT, env: env.NODE_ENV },
    'Server successfully started and listening for requests'
  );
});
