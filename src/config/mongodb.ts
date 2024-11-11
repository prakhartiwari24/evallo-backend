import dotenv from 'dotenv';
import mongoose from 'mongoose';
import logger from '../utils/logger';

dotenv.config();

class MongoDatabase {
  public async connect(): Promise<void> {
    try {
      await mongoose.connect(process.env.MONGODB_STRING as string);
    } catch (err) {
      logger.error(`error occured while connecting to MongoDB: ${err}`);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      logger.debug(`Mongodb connection closed`);
    } catch (err) {
      logger.error('Mongodb disconnection error', err);
      throw err;
    }
  }
}

export default MongoDatabase;
