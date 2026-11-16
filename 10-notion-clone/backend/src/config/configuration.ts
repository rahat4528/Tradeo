export default () => ({
  port: parseInt(process.env.PORT, 10) || 4009,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-notion-clone-jwt-key-32chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});
