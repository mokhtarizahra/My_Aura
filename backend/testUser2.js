import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {

  console.log("User2 connected:", socket.id);

  socket.emit("register", "user456");

  setTimeout(() => {

    socket.emit("sendMessage", {
      senderId: "user456",
      receiverId: "user123",
      text: "Hello from user456 "
    });

  }, 2000);

});

socket.on("newMessage", (data) => {
  console.log("User2 received message:", data);
});
