import { Response } from 'express';
import { validationResult } from 'express-validator';
import { EventService } from '../services/event.service';
import Event from '../models/event.model';
import logger from '../utils/logger';

const eventService = new EventService();

export class EventController {
  async createEvent(req: any, res: Response): Promise<void> {
    logger.info('Received request to create event');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation errors in createEvent request', {
        errors: errors.array(),
      });
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const event = await eventService.createEvent(req.body, req.user.id);
      res.status(201).json(event);
      logger.info(`Event created successfully with ID ${event._id}`);
    } catch (err: any) {
      logger.error(`Failed to create event: ${err.message}`);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getEvents(req: any, res: Response): Promise<void> {
    logger.info(`Received request to get events for user ${req.user.id}`);
    try {
      const events = await Event.find({ userId: req.user.id });
      res.status(200).json(events);
      logger.info(`Events retrieved for user ${req.user.id}`);
    } catch (err: any) {
      logger.error(`Failed to get events: ${err.message}`);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateEvent(req: any, res: Response): Promise<void> {
    const { id } = req.params;
    logger.info(`Received request to update event with ID ${id}`);

    try {
      const event = await eventService.updateEvent(id, req.body, req.user.id);
      if (!event) {
        logger.warn(`Event not found with ID ${id}`);
        res.status(404).json({ message: 'Event not found' });
        return;
      }
      res.status(200).json(event);
      logger.info(`Event updated successfully with ID ${event._id}`);
    } catch (err: any) {
      logger.error(`Failed to update event: ${err.message}`);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteEvent(req: any, res: Response): Promise<void> {
    const { id } = req.params;
    logger.info(`Received request to delete event with ID ${id}`);

    try {
      await eventService.deleteEvent(id, req.user.id);
      res.status(204).send();
      logger.info(`Event deleted successfully with ID ${id}`);
    } catch (err: any) {
      logger.error(`Failed to delete event: ${err.message}`);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
