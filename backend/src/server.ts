import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { initializeGameSocket } from './sockets/gameSocket';
import { seedInitialData } from './utils/seedData';

const startServer = async () => {
  await connectDB();
  await seedInitialData();

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  initializeGameSocket(io);

  const PORT = Number(env.PORT) || 5001;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 QuizApp Backend & Socket.IO running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
  });
};

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
});
