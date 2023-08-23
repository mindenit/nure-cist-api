import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { createApp } from './app';
import { env, config } from './config';

const app = createApp({
  logger: config[env.NODE_ENV].logger,
});

app.register(cors, {
  origin: '*',
  credentials: true,
});

app.register(helmet);

app.listen(
    {
      port: env.PORT,
      host: env.HOST ?? 'localhost'
    },
    (err, _address) => {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }
    }
  );
