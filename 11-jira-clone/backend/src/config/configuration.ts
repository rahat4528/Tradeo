export default () => ({
  port: parseInt(process.env.PORT, 10) || 4010,
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6384',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jira-clone-jwt-key-3010',
    expiresIn: '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3010',
  },
});
