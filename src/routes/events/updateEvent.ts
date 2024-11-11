import { googleAuth, googleAuthCallback } from '../../services/auth.service';
import { updateEvent } from '../../services/event.service';
import auth from '../middleware/auth';
import express from 'express';

const router = express.Router();

router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuthCallback);

router.put('/events/:id', auth, updateEvent);

export { router as updateEvent };
