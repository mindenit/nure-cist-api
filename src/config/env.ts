// Core
import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { env as processEnv } from 'process';

const EnvSchema = Type.Object({
  NODE_ENV: Type.String(),
  PORT: Type.Integer({ default: 3000 }),
  HOST: Type.Optional(Type.String()),
});

export const env = Value.Cast(EnvSchema, processEnv);