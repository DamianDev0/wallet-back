import { BullModuleOptions } from '@nestjs/bull';

export const getBullConfig = (): BullModuleOptions => ({
  redis: {
    host: process.env.REDIS_HOST || 'redis-17263.c100.us-east-1-4.ec2.cloud.redislabs.com',
    port: parseInt(process.env.REDIS_PORT || '17263', 10),
    password: process.env.REDIS_PASSWORD || 'Ms8TDbmR5uorYFA6Abi86uqOIU5FMuhi',
    username: process.env.REDIS_USERNAME || 'default',
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
