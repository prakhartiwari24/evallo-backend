import { google } from 'googleapis';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import { oauth2Client } from '../utils/oauth2Client';
import axios from 'axios';
import logger from '../utils/logger';

export class AuthService {
  async generateAuthUrl(): Promise<string> {
    logger.info('Generating Google OAuth URL');
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      prompt: 'consent',
    });
  }

  async handleGoogleCallback(code: string): Promise<string> {
    logger.info('Handling Google OAuth callback');
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens || !tokens.access_token) {
      logger.error('Failed to obtain access token from Google');
      throw new Error('Failed to obtain access token from Google.');
    }

    const accessToken = tokens.access_token;
    oauth2Client.setCredentials(tokens);

    const userInfo = await this.fetchUserInfo(accessToken);
    const user = await this.findOrCreateUser(userInfo, tokens);
    logger.info(`User authenticated: ${user.email}`);

    return this.generateJwtToken(user._id as string);
  }

  private async fetchUserInfo(
    accessToken: string
  ): Promise<{ email: string; name: string }> {
    logger.info('Fetching user info from Google');
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.data || !response.data.email) {
      logger.error('Failed to retrieve user information from Google');
      throw new Error('Failed to retrieve user information from Google.');
    }

    const { email, name } = response.data;
    logger.info(`User info fetched: ${email}`);
    return { email, name };
  }

  private async findOrCreateUser(
    userInfo: { email: string; name: string },
    tokens: any
  ) {
    logger.info(`Finding or creating user with email: ${userInfo.email}`);
    let user = await User.findOne({ email: userInfo.email });

    if (!user) {
      user = new User({
        email: userInfo.email,
        name: userInfo.name,
        googleId: tokens.id_token,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
      await user.save();
      logger.info(`New user created: ${user.email}`);
    } else {
      user.accessToken = tokens.access_token || '';
      user.refreshToken = tokens.refresh_token || '';
      await user.save();
      logger.info(`User tokens updated: ${user.email}`);
    }

    return user;
  }

  private generateJwtToken(userId: string): string {
    logger.info(`Generating JWT for user: ${userId}`);
    return jwt.sign({ id: userId }, process.env.JWT_KEY as string, {
      expiresIn: '1d',
    });
  }
}
