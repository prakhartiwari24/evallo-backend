import { googleAuth, googleAuthCallback } from '../../services/auth.service';
import { getEvents } from '../../services/event.service';
import auth from '../middleware/auth';
import express from 'express';

const router = express.Router();

router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuthCallback);

router.get('/events', auth, getEvents);

export { router as getEvents };
