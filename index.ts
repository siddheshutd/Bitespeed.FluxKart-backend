import * as http from 'http';

const port: number = Number(process.env.PORT) || 3000;

const server: http.Server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Speedbite Backend',
    status: 'Server is running',
    timestamp: new Date().toISOString()
  }));
});

server.listen(port, () => {
  console.log(`Speedbite backend server running on port ${port}`);
}); 