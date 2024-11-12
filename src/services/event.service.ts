import { google } from 'googleapis';
import Event, { IEvent } from '../models/event.model';
import User from '../models/user.model';
import logger from '../utils/logger';

export class EventService {
  async addEventToGoogleCalendar(userId: string, event: IEvent): Promise<void> {
    logger.info(`Adding event to Google Calendar for user ${userId}`);
    const user = await User.findById(userId);
    if (!user) {
      logger.error(`User not found for ID: ${userId}`);
      throw new Error('User not found');
    }

    const oauth2Client = this.createOAuthClient(user);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const googleEvent = this.createGoogleEventObject(event);
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: googleEvent,
    });

    event.googleCalendarId = response.data.id || '';
    await event.save();
    logger.info(
      `Event added to Google Calendar with ID ${event.googleCalendarId}`
    );
  }

  async updateEventInGoogleCalendar(
    userId: string,
    event: IEvent
  ): Promise<void> {
    if (!event.googleCalendarId) return;

    logger.info(
      `Updating event in Google Calendar for user ${userId} and event ID ${event.googleCalendarId}`
    );
    const user = await User.findById(userId);
    if (!user) {
      logger.error(`User not found for ID: ${userId}`);
      throw new Error('User not found');
    }

    const oauth2Client = this.createOAuthClient(user);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const googleEvent = this.createGoogleEventObject(event);
    await calendar.events.update({
      calendarId: 'primary',
      eventId: event.googleCalendarId,
      requestBody: googleEvent,
    });
    logger.info(
      `Event updated in Google Calendar with ID ${event.googleCalendarId}`
    );
  }

  async deleteEventFromGoogleCalendar(
    userId: string,
    googleCalendarId: string
  ): Promise<void> {
    logger.info(
      `Deleting event from Google Calendar for user ${userId} and event ID ${googleCalendarId}`
    );
    const user = await User.findById(userId);
    if (!user) {
      logger.error(`User not found for ID: ${userId}`);
      throw new Error('User not found');
    }

    const oauth2Client = this.createOAuthClient(user);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: googleCalendarId,
    });
    logger.info(
      `Event deleted from Google Calendar with ID ${googleCalendarId}`
    );
  }

  async createEvent(eventData: any, userId: string): Promise<IEvent> {
    logger.info(`Creating new event for user ${userId}`);
    const event = new Event({ ...eventData, userId });
    await event.save();
    await this.addEventToGoogleCalendar(userId, event);
    logger.info(`Event created with ID ${event._id}`);
    return event;
  }

  async updateEvent(
    id: string,
    eventData: any,
    userId: string
  ): Promise<IEvent | null> {
    logger.info(`Updating event for user ${userId} with event ID ${id}`);
    const event = await Event.findByIdAndUpdate(id, eventData, { new: true });
    if (!event) {
      logger.warn(`Event not found with ID ${id}`);
      return null;
    }
    await this.updateEventInGoogleCalendar(userId, event);
    logger.info(`Event updated with ID ${event._id}`);
    return event;
  }

  async deleteEvent(id: string, userId: string): Promise<void> {
    logger.info(`Deleting event with ID ${id} for user ${userId}`);
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      logger.warn(`Event not found with ID ${id}`);
      throw new Error('Event not found');
    }
    if (event.googleCalendarId) {
      await this.deleteEventFromGoogleCalendar(userId, event.googleCalendarId);
    }
    logger.info(`Event deleted with ID ${id}`);
  }

  private createOAuthClient(user: any) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: user.accessToken || '',
      refresh_token: user.refreshToken || '',
    });
    return oauth2Client;
  }

  private createGoogleEventObject(event: IEvent) {
    return {
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
  }
}
