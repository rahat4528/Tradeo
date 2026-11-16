export default () => ({
  port: parseInt(process.env.PORT, 10) || 4011,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-kanban-board-jwt-key-3011',
    expiresIn: '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3011',
  },
});
