import { EventController } from '../../controllers/event.controller';
import auth from '../middleware/auth';
import express from 'express';

const eventController = new EventController();

const router = express.Router();

router.post('/events', auth, eventController.createEvent);

export { router as createEvent };
