import express from 'express';
const router = express.Router();
import { createEvent, updateEvent, deleteEvent, getEvents } from './events';
import { AuthController } from '../controllers/auth.controller';

const authController = new AuthController();

router.use('/api/create', createEvent);
router.use('/api/update', updateEvent);
router.use('/api/get', getEvents);
router.use('/api/delete', deleteEvent);

router.get('/api/auth/google', (req, res) =>
  authController.googleAuth(req, res)
);
router.get('/api/auth/google/callback', (req, res) =>
  authController.googleAuthCallback(req, res)
);

router.get('/health', (req, res) => {
  const data = {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date(),
  };

  res.status(200).send(data);
});

router.all('*', async (req, res) => {
  res.status(404).send('Not found');
});

export { router };
