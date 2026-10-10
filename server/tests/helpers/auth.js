import { User } from '../../src/models/User.js';
import { signToken } from '../../src/utils/token.js';

export const TEST_PASSWORD = 'CorrectHorse123';

export const createAdmin = (overrides = {}) =>
  User.create({
    name: 'Test Admin',
    email: 'admin@example.com',
    password: TEST_PASSWORD,
    ...overrides,
  });

/** Cookie header value for a logged-in user, without going through /auth/login. */
export const cookieFor = (user) => `token=${signToken(user._id)}`;

/** superagent parser for XML responses (it only buffers text types by default). */
export const textParser = (res, callback) => {
  let data = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => callback(null, data));
};
