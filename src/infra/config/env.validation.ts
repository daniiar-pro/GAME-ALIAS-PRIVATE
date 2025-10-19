import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),

  // Auth
  JWT_SECRET: Joi.string().min(10).required(),
  JWT_EXPIRES: Joi.string().default('900s'),

  // Mongo
  MONGO_URI: Joi.string().uri().optional(),
  MONGO_HOST: Joi.string().default('localhost'),
  MONGO_PORT: Joi.number().default(27017),
  MONGO_DB_NAME: Joi.string().default('alias'),

  // Redis
  REDIS_URL: Joi.string().optional(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
});
