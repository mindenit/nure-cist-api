// Core
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';

// Tools
import { createApp } from './app';
import { env, config } from './config';
import initDB from './db';
import { scheduleRoute } from './routes/schedule';
import { schedulingParserJob } from './jobs/scheduling';

const app = createApp({
  logger: config[env.NODE_ENV].logger,
});

app.register(cors, {
  origin: '*',
  credentials: true,
});

app.register(helmet);


app.get('/spec', async (_req, _res) => {
  return app.swagger();
});


initDB().then().catch();

app.register(scheduleRoute, { prefix: '/api' })
schedulingParserJob().then().catch()


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

