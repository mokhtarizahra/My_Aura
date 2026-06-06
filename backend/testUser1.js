import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("User1 connected:", socket.id);

  socket.emit("register", "user123");
});

socket.on("newMessage", (data) => {
  console.log("User1 received message:", data);
});
