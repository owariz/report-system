class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await this.authService.login(email, password);
      if (result.error) return res.status(result.code).json({ isError: true, message: result.error });
      return res.status(200).json({ isError: false, message: 'Login successful!', ...result });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
  };

  register = async (req, res) => {
    const { email, username, password } = req.body;
    try {
      await this.authService.register(email, username, password);
      return res.status(201).json({ isError: false, message: 'Registration successful! Please check your email for verification.' });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ isError: true, message: 'Email already exists' });
      }
      return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
  };

  logout = async (req, res) => {
    const userId = req.user.uid;
    const { refreshToken } = req.body; // Changed from req.query to req.body
    try {
      if (!refreshToken) return res.status(400).json({ isError: true, message: 'Missing refresh token' });
      const result = await this.authService.logout(userId, refreshToken);
      if (result.error) return res.status(result.code).json({ isError: true, message: result.error });
      return res.status(200).json({ isError: false, message: 'Logout successful' });
    } catch (error) {
      return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
  };

  updateStatus = async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['online', 'offline', 'ban', 'mute'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ isError: true, message: 'Invalid status' });
    }
    try {
      await this.authService.updateStatus(req.user.uid, status);
      return res.status(200).json({ isError: false, message: 'Status updated successfully!' });
    } catch (error) {
      return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
  };

  refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    try {
      const result = await this.authService.refreshToken(refreshToken);
      if (result.error) return res.status(result.code).json({ isError: true, message: result.error });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
  };

  verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ isError: true, message: 'Verification token is required' });
    try {
      const result = await this.authService.verifyEmail(token);
      if (result.error) return res.status(result.code).json({ isError: true, message: result.error });
      return res.status(200).json({ isError: false, message: 'Email verified successfully!' });
    } catch (error) {
      return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
  };

  getMe = async (req, res) => {
    try {
      const result = await this.authService.getMe(req.user.uid);
      if (result.error) return res.status(result.code).json({ isError: true, message: result.error });
      return res.status(200).json({ isError: false, result });
    } catch (error) {
      return res.status(500).json({ isError: true, message: 'An error occurred' });
    }
  };
}

module.exports = AuthController;