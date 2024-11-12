import { EventController } from '../../controllers/event.controller';
import { AuthController } from '../../controllers/auth.controller';

import auth from '../middleware/auth';
import express from 'express';

const router = express.Router();
const eventController = new EventController();
const authController = new AuthController();

router.get('/auth/google', (req, res) => authController.googleAuth(req, res));
router.get('/auth/google/callback', (req, res) =>
  authController.googleAuthCallback(req, res)
);
router.get('/events', auth, eventController.getEvents);

export { router as getEvents };
