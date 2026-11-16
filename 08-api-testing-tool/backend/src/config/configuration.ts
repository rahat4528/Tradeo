export default () => ({
  port: parseInt(process.env.PORT, 10) || 4007,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-api-testing-tool-key-32chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  proxy: {
    dispatchTimeoutMs: parseInt(process.env.DISPATCH_TIMEOUT_MS, 10) || 15000,
    maxResponseBytes: parseInt(process.env.MAX_RESPONSE_BYTES, 10) || 10485760,
    allowLocalDispatch: process.env.ALLOW_LOCAL_DISPATCH === 'true',
  },
});
