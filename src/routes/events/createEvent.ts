import { createEvent } from '../../services/event.service';
import auth from '../middleware/auth';
import express from 'express';

const router = express.Router();

router.post('/events', auth, createEvent);

export { router as createEvent };
