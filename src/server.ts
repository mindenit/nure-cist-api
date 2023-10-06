// Core
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import fastifyCron from 'fastify-cron';

// Tools
import { createApp } from './app';
import { env, config } from './config';
import initDB from './db';
import { scheduleRoute } from './routes/schedule';

// Jobs
import { schedulingParserJob } from './jobs/scheduling';
import { groupsUpdate } from './jobs/groups';
import { teachersUpdate } from './jobs/teachers';
import { auditoriesUpdate } from './jobs/auditories';
import {authRoute} from './routes/auth';


(function () {
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

  app.register(fastifyCron, {
    jobs: [{
      cronTime: '0 6 * * *',
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onTick: async () => await groupsUpdate()
    },
      {
        cronTime: '15 6 * * *',
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onTick: async () => await teachersUpdate()
      },
      {
        cronTime: '30 6 * * *',
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onTick: async () => await auditoriesUpdate()
      }
      ]
  })

  app.get('/spec', async (_req, _res) => {
    return app.swagger();
  });


  initDB().then().catch();

  app.register(scheduleRoute, { prefix: '/api' })
  app.register(authRoute, { prefix: '/api' })
  schedulingParserJob().then().catch()


  app.listen(
      {
        port: env.PORT ?? 3000,
        host: env.HOST ?? 'localhost'
      },
      (err, _address) => {
        app.cron.startAllJobs();
        if (err) {
          app.log.error(err);
          process.exit(1);
        }
      }
  );
})()

