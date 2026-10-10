import { env } from '../config/env.js';
import { Profile } from '../models/Profile.js';
import { fetchGithubSummary } from '../services/github.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const TTL_MS = 60 * 60 * 1000; // GitHub's unauthenticated limit is 60 requests/hour, so cache for an hour

/** username -> { data, expires }. Exported so tests can reset or expire it. */
export const githubCache = new Map();

/** Accepts "name" or "https://github.com/name"; returns '' for anything that is not a valid username. */
export const usernameFrom = (value = '') => {
  const segment = String(value)
    .replace(/[?#].*$/, '')
    .replace(/\/+$/, '')
    .split('/')
    .pop();
  return /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/.test(segment) ? segment : '';
};

export const getGithub = asyncHandler(async (_req, res) => {
  let username = usernameFrom(env.githubUsername);
  if (!username) {
    const profile = await Profile.findOne({ key: 'main' }).select('github').lean();
    username = usernameFrom(profile?.github);
  }
  if (!username) throw new ApiError(404, 'GitHub username is not configured');

  const cached = githubCache.get(username);
  if (cached && cached.expires > Date.now()) {
    return res.set('Cache-Control', 'public, max-age=600').json({ success: true, data: cached.data });
  }

  try {
    const data = await fetchGithubSummary(username, env.githubToken);
    githubCache.set(username, { data, expires: Date.now() + TTL_MS });
    return res.set('Cache-Control', 'public, max-age=600').json({ success: true, data });
  } catch (err) {
    console.warn(`GitHub request failed for "${username}": ${err.status ?? 'network error'} ${err.message}`);
    // Better to show slightly old numbers than an error
    if (cached) return res.json({ success: true, data: cached.data, stale: true });
    if (err.status === 404) throw new ApiError(404, 'GitHub user not found');
    if (err.status === 403 || err.status === 429) {
      throw new ApiError(503, 'GitHub rate limit reached. Please try again later.');
    }
    throw new ApiError(502, 'GitHub is unavailable right now');
  }
});
