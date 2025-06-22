import * as http from 'http';
import * as dotenv from 'dotenv';
import prisma from './lib/prisma';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ContactController } from './controllers/contactController';

dotenv.config();
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port: number = Number(process.env.PORT) || 3000;

const contactController = new ContactController();

app.post('/identify', contactController.identify.bind(contactController));

async function connectToDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('PostgreSQL database connected.');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
}

const server: http.Server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
});

async function startServer(): Promise<void> {
  await connectToDatabase();
  
  app.listen(port, () => {
    console.log(`Speedbite backend server running on port ${port}`);
  });
}

process.on('SIGINT', async () => {
  console.log('Shutting down');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('Shutting down');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 