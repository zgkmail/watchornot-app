const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Derives a key from the master encryption key and salt
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypts a string using AES-256-GCM
 * @param {string} text - The text to encrypt
 * @param {string} masterKey - The master encryption key
 * @returns {string} - Encrypted text in format: salt:iv:encrypted:authTag
 */
function encrypt(text, masterKey) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(masterKey, salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return as base64 encoded string: salt:iv:encrypted:authTag
  return [
    salt.toString('hex'),
    iv.toString('hex'),
    encrypted,
    authTag.toString('hex')
  ].join(':');
}

/**
 * Decrypts a string encrypted with encrypt()
 * @param {string} encryptedData - The encrypted data in format: salt:iv:encrypted:authTag
 * @param {string} masterKey - The master encryption key
 * @returns {string} - Decrypted text
 */
function decrypt(encryptedData, masterKey) {
  const parts = encryptedData.split(':');

  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format');
  }

  const salt = Buffer.from(parts[0], 'hex');
  const iv = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  const authTag = Buffer.from(parts[3], 'hex');

  const key = deriveKey(masterKey, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};
