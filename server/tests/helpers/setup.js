// Runs before every test file (see vitest.config.js), before the app is imported.
// dotenv never overrides variables that already exist, so these values win over server/.env.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI =
  process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_test';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123456';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.SITE_URL = 'https://portfolio.test';
process.env.COOKIE_SAMESITE = 'lax';
process.env.COOKIE_DOMAIN = '';
process.env.SERVER_URL = '';
process.env.RESUME_URL = '';
process.env.TRUST_PROXY = '1';

// Never send real email or touch real cloud storage during tests
for (const key of [
  'RESEND_API_KEY',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'CONTACT_RECEIVER',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
]) {
  process.env[key] = '';
}

// Safety net: the tests delete data, so they may only run against a database named *_test
const dbName = process.env.MONGODB_URI.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]*)/)?.[1] || '';
if (!/_test$/.test(dbName)) {
  throw new Error(
    `Refusing to run tests: database "${dbName}" does not end with "_test". ` +
      'Set TEST_MONGODB_URI to a dedicated test database, e.g. mongodb://127.0.0.1:27017/portfolio_test',
  );
}
