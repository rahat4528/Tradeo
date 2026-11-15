export default () => ({
  port: parseInt(process.env.PORT || '4004', 10),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://tradeo_user:tradeo_secure_pass@localhost:5436/inventory_management_db?schema=public',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6381', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-inventory-management-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3004',
});
