// Core
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';

// Tools
import { createApp } from './app';
import { env, config } from './config';
import initDB from './db';
import { scheduleRoute } from './routes/schedule';
import { authRoute } from './routes/auth';

// Jobs
import { schedulingParserJob } from './jobs/scheduling';

initDB().then().catch();
schedulingParserJob().then().catch();


(async function async() {
  const app = createApp({
    logger: config[env.NODE_ENV].logger,
  });

  app.register(cors, {
    origin: '*',
    credentials: true,
  });

  app.register(helmet);

  app.register(rateLimit, {
    ban: 2,
    addHeadersOnExceeding: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true
    },
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true
    }
  })

  app.get('/spec', async (_req, _res) => {
    return app.swagger();
  });

  app.register(scheduleRoute, {prefix: '/api'})
  app.register(authRoute, {prefix: '/api'})

  app.listen(
      {
        port: env.PORT ?? 3000,
        host: env.HOST ?? 'localhost'
      },
      (err, _address) => {
        if (err) {
          app.log.error(err);
          process.exit(1);
        }
      }
  );
})()

