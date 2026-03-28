import { RATE_LIMIT_WINDOW, RATE_LIMIT_MAX_REQUESTS } from './constants.js';

export const rateLimits = new Map();

export const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const userLimit = rateLimits.get(ip) || { count: 0, reset: now + RATE_LIMIT_WINDOW };

  if (now > userLimit.reset) {
    userLimit.count = 0;
    userLimit.reset = now + RATE_LIMIT_WINDOW;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
  }

  userLimit.count++;
  rateLimits.set(ip, userLimit);
  next();
};
