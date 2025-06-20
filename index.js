const http = require('http');
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
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