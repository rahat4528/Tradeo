export default () => ({
  port: parseInt(process.env.PORT || '4003', 10),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://tradeo_user:tradeo_secure_pass@localhost:5435/task_management_db?schema=public',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6380', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-task-management-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3003',
});
