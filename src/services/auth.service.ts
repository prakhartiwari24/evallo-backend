import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { google } from 'googleapis';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import { oauth2Client } from '../utils/oauth2Client';
import axios from 'axios';

dotenv.config();

export const googleAuth = (req: Request, res: Response): void => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    prompt: 'consent',
  });
  res.redirect(authUrl);
};

export const googleAuthCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.query;
    if (!code) {
      throw new Error('Authorization code not provided by Google.');
    }
    const { tokens } = await oauth2Client.getToken(code as string);

    if (!tokens || !tokens.access_token) {
      throw new Error('Failed to obtain access token from Google.');
    }
    const accessToken = tokens.access_token;
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });

    const userInfoResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!userInfoResponse.data || !userInfoResponse.data.email) {
      throw new Error('Failed to retrieve user information from Google.');
    }
    const { email, name } = userInfoResponse.data;
    if (!email) {
      throw new Error('Google account did not provide an email address.');
    }
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        name,
        googleId: tokens.id_token,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
      await user.save();
    } else {
      user.accessToken = tokens.access_token || '';
      user.refreshToken = tokens.refresh_token || '';
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_KEY as string, {
      expiresIn: '1d',
    });
    res.json({ token: jwtToken });
  } catch (err: any) {
    console.error('Error in Google OAuth callback:', err.message);
    res
      .status(500)
      .json({ message: 'Authentication failed', error: err.message });
  }
};
