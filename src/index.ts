import * as http from 'http';
import * as dotenv from 'dotenv';
import prisma from './lib/prisma';

dotenv.config();

const port: number = Number(process.env.PORT) || 3000;

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
  
  server.listen(port, () => {
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