// Core
import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { env as processEnv } from 'process';

const EnvSchema = Type.Object({
  NODE_ENV: Type.String(),
  PORT: Type.Integer({ default: 3000 }),
  HOST: Type.Optional(Type.String()),
  API_URL: Type.String(),
  API_KEY: Type.String(),
  DB_URI: Type.String(),
  ACCESS_SECRET: Type.String(),
  REFRESH_SECRET: Type.String(),
  ACCESS_TIME: Type.String(),
  REFRESH_TIME: Type.String(),
});

export const env = Value.Cast(EnvSchema, processEnv);
