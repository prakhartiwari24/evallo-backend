import { google } from 'googleapis';
import Event, { IEvent } from '../models/event.model';
import User from '../models/user.model';
import { validationResult } from 'express-validator';
import { Response } from 'express';

const addEventToGoogleCalendar = async (userId: string, event: IEvent) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const oauth2Client = new google.auth.OAuth2();

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const googleEvent = {
    summary: event.title,
    description: event.description,
    start: {
      dateTime: new Date(event.date).toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: new Date(
        new Date(event.date).getTime() + event.duration * 60 * 60 * 1000
      ).toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    attendees: event.participants.map((email) => ({ email })),
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: googleEvent,
  });
  event.googleCalendarId = response.data.id || '';
  await event.save();
};

export const createEvent = async (req: any, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const event = new Event({ ...req.body, userId: req.user.id });
    await event.save();
    await addEventToGoogleCalendar(req.user.id, event);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEvents = async (req: any, res: Response): Promise<void> => {
  try {
    const events = await Event.find({ userId: req.user.id });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateEvent = async (req: any, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const event = await Event.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    await updateEventInGoogleCalendar(req.user.id, event);
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateEventInGoogleCalendar = async (userId: string, event: IEvent) => {
  const user = await User.findById(userId);

  if (!user) throw new Error('User not found');

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: user.accessToken || '',
    refresh_token: user.refreshToken || '',
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  if (!event.googleCalendarId) return;

  const googleEvent = {
    summary: event.title,
    description: event.description,
    start: {
      dateTime: new Date(event.date).toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: new Date(
        new Date(event.date).getTime() + event.duration * 60 * 60 * 1000
      ).toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    attendees: event.participants.map((email) => ({ email })),
  };

  await calendar.events.update({
    calendarId: 'primary',
    eventId: event.googleCalendarId,
    requestBody: googleEvent,
  });
};

export const deleteEvent = async (req: any, res: Response) => {
  const { id } = await req.params;
  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      res.status(404).json({
        message: 'Event not found',
      });
      return;
    }
    if (event.googleCalendarId) {
      await deleteEventFromGoogleCalendar(req.user.id, event.googleCalendarId);
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ messgae: 'Server Error' });
  }
};

const deleteEventFromGoogleCalendar = async (
  userId: string,
  googleCalendarId: string
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: user.accessToken || '',
    refresh_token: user.refreshToken || '',
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  await calendar.events.delete({
    calendarId: 'primary',
    eventId: googleCalendarId,
  });
};
