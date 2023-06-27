import { Application, json, urlencoded, Response, Request, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import HTTP_STATUS from 'http-status-codes';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieSession from 'cookie-session';
import 'express-async-errors';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import Logger from 'bunyan';
import { config } from '@root/config';
import applicationRoutes from '@root/routes';
import { CustomError, IErrorResponse } from '@global/helpers/error-handler';

const SERVER_PORT = 5000;
const log: Logger = config.createLogger('setupServer.ts');

type ChattyServerProps = {
  app: Application;
};

export const ChattyServer = ({ app }: ChattyServerProps): void => {
  //
  // configuration for cookie-session, helmet, hpp and cors
  const securityMiddleware = (app: Application): void => {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
        maxAge: 24 * 7 * 3600000, // time cookie should be valid for
        secure: config.NODE_ENV !== 'development' // true for production
      })
    );

    app.use(helmet());
    app.use(hpp());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200, // older browsers
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      })
    );
  };

  // configuration for compression, json and urlencoded
  const standardMiddleware = (app: Application): void => {
    app.use(compression()); // for helping to decrease bandwidth
    app.use(json({ limit: '50mb' })); // Controls the maximum request body size
    app.use(urlencoded({ extended: true, limit: '50mb' })); // recognise strings and objects
  };

  const routesMiddleware = (app: Application): void => {
    applicationRoutes(app);
  };

  // Global error handler
  const globalErrorHandler = (app: Application): void => {
    app.all('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });
    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.error(error);
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    });
  };

  // Start server
  const startServer = async (app: Application): Promise<void> => {
    try {
      const httpServer: http.Server = new http.Server(app);

      // Call our createSocketIO function
      const socketIO: Server = await createSocketIO(httpServer);
      startHttpServer(httpServer);
      socketIOConnections(socketIO);
    } catch (error) {
      log.error(error);
    }
  };

  // SocketIO
  const createSocketIO = async (httpServer: http.Server): Promise<Server> => {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  };

  // start http server
  const startHttpServer = async (httpServer: http.Server): Promise<void> => {
    log.info(`Server has started with process ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Server listening on port ${SERVER_PORT}`);
    });
  };

  // define connections
  const socketIOConnections = (io: Server) => {
    return io;
  };

  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  globalErrorHandler(app);

  startServer(app);
};
