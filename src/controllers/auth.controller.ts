import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import logger from '../utils/logger';

const authService = new AuthService();

export class AuthController {
  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Redirecting to Google OAuth');
      const authUrl = await authService.generateAuthUrl();
      res.redirect(authUrl);
    } catch (err: any) {
      logger.error(`Failed to initiate authentication: ${err.message}`);
      res.status(500).json({
        message: 'Failed to initiate authentication',
        error: err.message,
      });
    }
  }

  async googleAuthCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.query;
      if (!code) throw new Error('Authorization code not provided by Google.');

      logger.info('Processing Google OAuth callback');
      const jwtToken = await authService.handleGoogleCallback(code as string);
      res.redirect(`${process.env.CLIENT_ENDPOINT}/calendar?token=${jwtToken}`);
    } catch (error: any) {
      logger.error(`Error in Google OAuth callback: ${error.message}`);
      res
        .status(500)
        .json({ message: 'Authentication failed', error: error.message });
    }
  }
}
