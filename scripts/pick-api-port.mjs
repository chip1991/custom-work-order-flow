import net from "node:net";

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(false));
    server.listen({ port, host: "127.0.0.1" }, () => {
      server.close(() => resolve(true));
    });
  });
}

const start = Number(process.env.API_PORT_START ?? "4000");
const end = Number(process.env.API_PORT_END ?? "4999");

for (let port = start; port <= end; port += 1) {
  const ok = await canListen(port);
  if (ok) {
    process.stdout.write(String(port));
    process.exit(0);
  }
}

process.stderr.write("No available port found");
process.exit(1);
