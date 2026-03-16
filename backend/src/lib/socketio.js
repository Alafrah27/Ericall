import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  socket.on("incoming-call", (data) => {
    console.log(data);
  });

  socket.on("answer-call", (data) => {
    console.log(data);
  });

  socket.on("end-call", (data) => {
    console.log(data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

export default {
  io,
  server,
  app,
};
