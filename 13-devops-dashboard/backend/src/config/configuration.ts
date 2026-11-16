export default () => ({
  port: parseInt(process.env.PORT, 10) || 4012,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-devops-dashboard-jwt-key-3012',
    expiresIn: '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3012',
  },
});
