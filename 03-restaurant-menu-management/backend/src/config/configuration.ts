export default () => ({
  port: parseInt(process.env.PORT || '4002', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:4002',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3002',
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key-tradeo-phase3-restaurant-menu',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://tradeo_user:tradeo_password@localhost:5432/restaurant_menu_db?schema=public',
  },
  storage: {
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.S3_SECRET_KEY || 'minioadmin',
    bucket: process.env.S3_BUCKET || 'tradeo-menu-images',
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '150', 10),
  },
});
