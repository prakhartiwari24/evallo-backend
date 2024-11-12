import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import http from 'http';
import logger from './utils/logger';
import MongoDatabase from './config/mongodb';
import { router } from './routes';
import cors from 'cors';

dotenv.config();

class App {
  public readonly mongoDatabase: MongoDatabase;
  private readonly server: http.Server;
  private readonly app: express.Application;
  constructor() {
    this.app = express();
    this.app.use(cors());
    this.mongoDatabase = new MongoDatabase();
    this.server = http.createServer(this.app);

    this.setupShutdownHandler();
    const morganFormat = ':method :url :status :response-time ms';
    this.app.use(
      morgan(morganFormat, {
        stream: {
          write: (message: any) => {
            const logObject = {
              method: message.split(' ')[0],
              url: message.split(' ')[1],
              status: message.split(' ')[2],
              responseTime: message.split(' ')[3],
            };
            logger.info(JSON.stringify(logObject));
          },
        },
      })
    );
  }

  private async setupShutdownHandler(): Promise<void> {
    const shutdown = async () => {
      console.log('Received SIGTERM signal, shutting down gracefully...');
      await Promise.all([this.mongoDatabase.disconnect()]);
      this.server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    };
    process.on('SIGTERM', shutdown);
  }
  public async start(): Promise<void> {
    this.app.use(express.json());
    this.app.use(router);
    this.app.use(express.urlencoded({ extended: true }));
    await Promise.all([this.mongoDatabase.connect()]);
    const port = '5002';
    this.server.listen(port, () => {
      console.log('Server listening on port 5002 🚀');
    });
  }
}

export let application = new App();
application.start();
