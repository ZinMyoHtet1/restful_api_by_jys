import { createClient } from "redis";

const client = createClient({ port: 6379, host: "127.0.0.1" });
client.on("connect", () => {
  console.log("Redis client is connected ....");
});
client.on("error", (err) => {
  console.log(err.message);
});
client.on("ready", () => {
  console.log("Redis client is connected and ready to use ...");
});
client.on("end", () => {
  console.log("Redis is disconnected...");
});

client.connect();

process.on("SIGINT", () => {
  client.quit();
});

export default client;
