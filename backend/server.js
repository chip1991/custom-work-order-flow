const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Backend is running\n');
});

const port = 3000;
server.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}/`);
});
