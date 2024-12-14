const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');


// Load RSA keys for asymmetric signing
const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, '../keys/private.key'), 'utf8');
const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '../keys/public.key'), 'utf8');

const jwtConfig = {
  issuer: 'yourdomain.com',               // Define the issuer
  audience: 'yourapp',                    // Intended audience
  algorithm: 'RS256',                     // Asymmetric signing algorithm
  accessTokenTtl: '15m',                  // Access token validity
  refreshTokenTtl: '7d',                  // Refresh token validity
};

// Generate Access Token
const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    role: user.role,
  };

  return jwt.sign(payload, PRIVATE_KEY, {
    algorithm: jwtConfig.algorithm,
    expiresIn: jwtConfig.accessTokenTtl,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
  };

  return jwt.sign(payload, PRIVATE_KEY, {
    algorithm: jwtConfig.algorithm,
    expiresIn: jwtConfig.refreshTokenTtl,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });
};

// Verify Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, PUBLIC_KEY, {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

// Decode Token Without Verification (for debugging)
const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
};
