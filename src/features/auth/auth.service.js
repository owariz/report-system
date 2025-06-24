const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { generateToken } = require('../../core/utils/jwt');
const { sendVerificationEmail } = require('../../core/utils/verificationemail');
const { createLog } = require('../../core/utils/log');

// Auth Service (business logic)
class AuthService {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  createRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
  }

  async login(email, password) {
    const user = await this.authRepository.findAccountByEmail(email);
    if (!user) return { error: 'User not found', code: 404 };
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return { error: 'Invalid credentials', code: 401 };
    if (!user.isVerified) return { error: 'Email not verified', code: 403 };
    const accessToken = generateToken(user);
    const refreshToken = this.createRefreshToken();
    await this.authRepository.updateAccountByEmail(email, { refreshToken, lastLogin: new Date(), status: 'online' });
    
    // Create a log entry for successful login
    await createLog({
      email: user.email,
      username: user.username || user.email || 'unknown',
      action: 'User Login',
      details: `User ${user.username || user.email || 'unknown'} logged in successfully.`,
    });

    return { accessToken, refreshToken, user };
  }

  async register(email, username, password) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.authRepository.createAccount({ email, username, password: hashedPassword, verificationToken });
    await sendVerificationEmail(email, verificationToken);

    // Create a log entry for registration
    await createLog({
      email: email,
      username: username,
      action: 'User Registration',
      details: `New user '${username}' registered with email ${email}.`,
    });
    
    return true;
  }

  async logout(userId, refreshToken) {
    const user = await this.authRepository.findAccountByUid(userId);
    if (!user || user.refreshToken !== refreshToken) return { error: 'Invalid refresh token', code: 403 };
    await this.authRepository.updateAccountByUid(userId, { refreshToken: null, status: 'offline' });
    
    await createLog({
      email: user.email,
      username: user.username || user.email || 'unknown',
      action: 'User Logout',
      details: `User ${user.username || user.email || 'unknown'} logged out.`,
    });

    return true;
  }

  async updateStatus(uid, status) {
    await this.authRepository.updateAccountByUid(uid, { status });
    return true;
  }

  async refreshToken(refreshToken) {
    const user = await this.authRepository.findAccountByRefreshToken(refreshToken);
    if (!user) return { error: 'Invalid refresh token', code: 403 };
    const newRefreshToken = this.createRefreshToken();
    await this.authRepository.updateAccountByEmail(user.email, { refreshToken: newRefreshToken });
    const accessToken = generateToken(user);
    return { accessToken, refreshToken: newRefreshToken, isVerified: user.isVerified };
  }

  async verifyEmail(token) {
    const user = await this.authRepository.findAccountByVerificationToken(token);
    if (!user) return { error: 'Invalid verification token', code: 400 };
    await this.authRepository.updateAccountByUid(user.uid, { isVerified: true, verificationToken: null });
    return true;
  }

  async getMe(uid) {
    const user = await this.authRepository.findAccountByUidForMe(uid);
    if (!user) return { error: 'User not found', code: 404 };
    return user;
  }
}

module.exports = AuthService; 