import { googleAuth, googleAuthCallback } from '../../services/auth.service';
import { deleteEvent } from '../../services/event.service';
import auth from '../middleware/auth';
import express from 'express';

const router = express.Router();

router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuthCallback);

router.delete('/events/:id', auth, deleteEvent);

export { router as deleteEvent };
